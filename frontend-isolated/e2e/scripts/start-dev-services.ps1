# Get the script's directory path
$ErrorActionPreference = "Stop"
Write-Host "Starting dev services script..."

# Kill any existing processes
Write-Host "Cleaning up existing processes..."
Get-Process -Name python* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name node* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2  # Give processes time to fully terminate

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Resolve-Path (Join-Path $scriptPath "..\..")
$apiPath = Resolve-Path (Join-Path $rootPath "..\api-isolated")

Write-Host "Verifying paths..."
if (-not (Test-Path $rootPath)) {
    Write-Error "Root path does not exist: $rootPath"
    exit 1
}
if (-not (Test-Path $apiPath)) {
    Write-Error "API path does not exist: $apiPath"
    exit 1
}

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

Write-Host "You can stop the services by running: Get-Process -Id $($djangoProcess.Id),$($viteProcess.Id) | Stop-Process -Force" 