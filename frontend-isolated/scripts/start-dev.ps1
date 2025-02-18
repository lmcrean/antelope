$ErrorActionPreference = "Stop"
Write-Host "Starting development servers..."

# Get the script's directory path
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Resolve-Path (Join-Path $scriptPath "..")
$apiPath = Resolve-Path (Join-Path $rootPath "..\api-isolated")

# Kill any existing processes
Write-Host "Cleaning up existing processes..."
Get-Process -Name python* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name node* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2  # Give processes time to fully terminate

# Start Django server
Write-Host "Starting Django development server..."
Start-Process -FilePath "python" -ArgumentList "manage.py", "runserver", "8000" -WorkingDirectory $apiPath -WindowStyle Normal

# Start Vite dev server
Write-Host "Starting Vite development server..."
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory $rootPath -WindowStyle Normal

Write-Host "`nDevelopment servers are starting..."
Write-Host "- Frontend will be available at: http://localhost:3001"
Write-Host "- Backend API will be available at: http://localhost:8000"
Write-Host "`nTo stop the servers, run: Stop-Process -Name python*,node* -Force" 