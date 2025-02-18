# Start the development services in the background
$frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run dev" -PassThru -WindowStyle Hidden

# Get the absolute path to the API directory
$apiPath = Resolve-Path (Join-Path $PSScriptRoot "../../../api-isolated")
$apiProcess = Start-Process -FilePath "python" -ArgumentList "-m uvicorn api_app.main:app --reload" -WorkingDirectory $apiPath -PassThru -WindowStyle Hidden

Write-Host "Starting development services..."
Write-Host "Frontend PID: $($frontendProcess.Id)"
Write-Host "API PID: $($apiProcess.Id)"

# Wait for services to start
Start-Sleep -Seconds 5

try {
    # Run the API health check test
    Write-Host "Running API health check test..."
    npx playwright test api-health.spec.ts
} finally {
    # Clean up processes
    Write-Host "Cleaning up processes..."
    if ($frontendProcess) {
        Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($apiProcess) {
        Stop-Process -Id $apiProcess.Id -Force -ErrorAction SilentlyContinue
    }
} 