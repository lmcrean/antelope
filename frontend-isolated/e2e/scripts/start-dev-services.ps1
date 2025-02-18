# Get the script's directory path
$ErrorActionPreference = "Stop"
Write-Host "Starting dev services script..."

# Kill any existing processes
Write-Host "Cleaning up existing processes..."
Get-Process -Name python* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name node* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2  # Give processes time to fully terminate

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Script path: $scriptPath"

$rootPath = Resolve-Path (Join-Path $scriptPath "..\..")
Write-Host "Root path: $rootPath"

$apiPath = Resolve-Path (Join-Path $rootPath "..\api-isolated")
Write-Host "API path: $apiPath"

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
                Write-Error "$serviceName failed to start within $timeoutSeconds seconds"
                return $false
            }
            Write-Host "Waiting for $serviceName... ($([math]::Round($elapsed.TotalSeconds))s)"
            Start-Sleep -Seconds 1
        }
    }
}

# Set environment variables
$env:PYTHONUNBUFFERED = "1"
$env:VITE_API_URL = "http://localhost:8000"

Write-Host "Environment variables set:"
Write-Host "VITE_API_URL: $env:VITE_API_URL"

# Start Django server
Write-Host "Starting Django development server..."
try {
    $djangoProcess = Start-Process -FilePath "python" -ArgumentList "manage.py", "runserver", "8000" -WorkingDirectory $apiPath -PassThru -WindowStyle Hidden
    Write-Host "Django server started with PID: $($djangoProcess.Id)"
    
    # Wait for Django to be ready
    if (-not (Wait-ForService -url "http://localhost:8000/api/health/" -serviceName "Django API" -timeoutSeconds 30)) {
        throw "Django server failed to start properly"
    }
} catch {
    Write-Error "Failed to start Django server: $_"
    exit 1
}

# Start Vite dev server
Write-Host "Starting Vite development server..."
try {
    $viteProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory $rootPath -PassThru -WindowStyle Hidden
    Write-Host "Vite server started with PID: $($viteProcess.Id)"
    
    # Wait for Vite to be ready
    if (-not (Wait-ForService -url "http://localhost:3001" -serviceName "Vite Dev Server" -timeoutSeconds 30)) {
        throw "Vite server failed to start properly"
    }
} catch {
    Write-Error "Failed to start Vite server: $_"
    if ($djangoProcess -and !$djangoProcess.HasExited) {
        Stop-Process -Id $djangoProcess.Id -Force
    }
    exit 1
}

Write-Host "All services are ready!"
Write-Host "Django server running with PID: $($djangoProcess.Id)"
Write-Host "Vite server running with PID: $($viteProcess.Id)"
Write-Host "You can stop the services by running: Get-Process -Id $($djangoProcess.Id),$($viteProcess.Id) | Stop-Process -Force"

# Return success
exit 0 