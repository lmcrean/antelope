# Get the script's directory path
$ErrorActionPreference = "Stop"
Write-Host "Starting dev services script..."

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

Write-Host "Starting services from paths:"
Write-Host "Root path: $rootPath"
Write-Host "API path: $apiPath"

# Start Django server
Write-Host "Starting Django development server..."
$env:PYTHONUNBUFFERED = "1"
try {
    $djangoProcess = Start-Process -FilePath "python" -ArgumentList "manage.py", "runserver", "8000" -WorkingDirectory $apiPath -PassThru -NoNewWindow
    Write-Host "Django server started with PID: $($djangoProcess.Id)"
} catch {
    Write-Error "Failed to start Django server: $_"
    exit 1
}

# Start Vite dev server
Write-Host "Starting Vite development server..."
try {
    $viteProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory $rootPath -PassThru -NoNewWindow
    Write-Host "Vite server started with PID: $($viteProcess.Id)"
} catch {
    Write-Error "Failed to start Vite server: $_"
    if ($djangoProcess -and !$djangoProcess.HasExited) {
        Stop-Process -Id $djangoProcess.Id -Force
    }
    exit 1
}

# Function to cleanup processes
function Cleanup {
    Write-Host "Cleaning up processes..."
    if ($djangoProcess -and !$djangoProcess.HasExited) {
        Write-Host "Stopping Django server (PID: $($djangoProcess.Id))..."
        Stop-Process -Id $djangoProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($viteProcess -and !$viteProcess.HasExited) {
        Write-Host "Stopping Vite server (PID: $($viteProcess.Id))..."
        Stop-Process -Id $viteProcess.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Cleanup complete."
}

# Set up cleanup on script exit
$null = Register-ObjectEvent -InputObject $djangoProcess -EventName Exited -Action { 
    Write-Host "Django server exited."
    Cleanup 
}
$null = Register-ObjectEvent -InputObject $viteProcess -EventName Exited -Action { 
    Write-Host "Vite server exited."
    Cleanup 
}

# Wait for both processes
try {
    Write-Host "Services started successfully. Press Ctrl+C to stop..."
    Wait-Process -Id $djangoProcess.Id
} catch {
    Write-Error "Error while running services: $_"
} finally {
    Write-Host "Shutting down services..."
    Cleanup
} 