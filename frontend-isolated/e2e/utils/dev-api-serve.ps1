# Set environment variables for test mode
$env:PORT = "8000"
$env:NODE_ENV = "test"
$env:VITEST_MODE = if ($env:VITEST_MODE) { $env:VITEST_MODE } else { "false" }

Write-Host "Starting API server in test mode..."
Write-Host "PORT: $env:PORT"
Write-Host "NODE_ENV: $env:NODE_ENV"
Write-Host "VITEST_MODE: $env:VITEST_MODE"

# Navigate to the API directory (from the frontend-isolated directory)
$apiPath = Join-Path -Path (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)) -ChildPath "api-isolate"
Set-Location -Path $apiPath

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..."
    npm install
}

# Start the server
npm run dev
