# Get the script's directory path
$ErrorActionPreference = "Stop"
Write-Host "Starting JWT button dev test..."

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Resolve-Path (Join-Path $scriptPath "..\..")
$apiPath = Resolve-Path (Join-Path $rootPath "..\api-isolated")

# Function to wait for a service to be ready
function Wait-ForService {
    param (
        [string]$url,
        [int]$timeoutSeconds = 30,
        [string]$serviceName
    )
    
    Write-Host "Waiting for $serviceName to be ready at $url..."
    $start = Get-Date
    
    while ($true) {
        try {
            $response = Invoke-WebRequest -Uri $url -Method GET -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host "$serviceName is ready!"
                return $true
            }
        } catch {
            $elapsed = (Get-Date) - $start
            if ($elapsed.TotalSeconds -gt $timeoutSeconds) {
                Write-Error "$serviceName did not become ready within $timeoutSeconds seconds"
                return $false
            }
        }
        Start-Sleep -Seconds 1
    }
}

# Clean up any existing processes
Write-Host "Cleaning up existing processes..."
Get-Process -Name python* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name node* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start Django server
Write-Host "Starting Django server..."
Set-Location $apiPath
$djangoProcess = Start-Process python -ArgumentList "manage.py", "runserver", "8000" -PassThru -NoNewWindow
Write-Host "Django server running with PID: $($djangoProcess.Id)"

# Start Vite server
Write-Host "Starting Vite server..."
Set-Location $rootPath
$viteProcess = Start-Process npm -ArgumentList "run", "dev", "--", "--port", "3001" -PassThru -NoNewWindow
Write-Host "Vite server running with PID: $($viteProcess.Id)"

# Wait for both services
$djangoReady = Wait-ForService -url "http://localhost:8000/api/health/" -serviceName "Django Server"
$viteReady = Wait-ForService -url "http://localhost:3001" -serviceName "Vite Dev Server"

if (-not $djangoReady -or -not $viteReady) {
    Write-Error "Failed to start services"
    exit 1
}

# Run the JWT test
Write-Host "Running JWT button test..."
try {
    Set-Location $rootPath
    npx playwright test e2e/tests/dev-mode-jwt.spec.ts --headed
    if ($LASTEXITCODE -ne 0) {
        Write-Error "JWT button test failed"
        exit 1
    }
} catch {
    Write-Error "Error running test: $_"
    exit 1
} finally {
    # Cleanup services
    Write-Host "Cleaning up services..."
    if ($djangoProcess) { Stop-Process -Id $djangoProcess.Id -Force -ErrorAction SilentlyContinue }
    if ($viteProcess) { Stop-Process -Id $viteProcess.Id -Force -ErrorAction SilentlyContinue }
    Get-Process -Name python* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Get-Process -Name node* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
} 