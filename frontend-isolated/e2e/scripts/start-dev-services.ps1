# Get the script's directory path
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Resolve-Path (Join-Path $scriptPath "..\..")
$apiPath = Resolve-Path (Join-Path $rootPath "..\api-isolated")

Write-Host "Starting services from paths:"
Write-Host "Root path: $rootPath"
Write-Host "API path: $apiPath"

# Start Django server
Write-Host "Starting Django development server..."
$env:PYTHONUNBUFFERED = "1"
$djangoProcess = Start-Process -FilePath "python" -ArgumentList "manage.py", "runserver", "8000" -WorkingDirectory $apiPath -PassThru -NoNewWindow

# Start Vite dev server
Write-Host "Starting Vite development server..."
$viteProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory $rootPath -PassThru -NoNewWindow

# Function to cleanup processes
function Cleanup {
    if ($djangoProcess -and !$djangoProcess.HasExited) {
        Stop-Process -Id $djangoProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($viteProcess -and !$viteProcess.HasExited) {
        Stop-Process -Id $viteProcess.Id -Force -ErrorAction SilentlyContinue
    }
}

# Set up cleanup on script exit
$null = Register-ObjectEvent -InputObject $djangoProcess -EventName Exited -Action { Cleanup }
$null = Register-ObjectEvent -InputObject $viteProcess -EventName Exited -Action { Cleanup }

# Wait for both processes
try {
    Write-Host "Services started. Press Ctrl+C to stop..."
    Wait-Process -Id $djangoProcess.Id
} finally {
    Cleanup
} 