# Get the script's directory path
$ErrorActionPreference = "Stop"
Write-Host "Starting dev tests..."

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Resolve-Path (Join-Path $scriptPath "..\..")

# Start the services
Write-Host "Starting dev services..."
& "$scriptPath\start-dev-services.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to start dev services"
    exit 1
}

# Run the tests
Write-Host "Running Playwright tests..."
try {
    Set-Location $rootPath
    npx playwright test e2e/tests/dev-mode.spec.ts --headed
} finally {
    # Cleanup services
    Write-Host "Cleaning up services..."
    Get-Process -Name python* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Get-Process -Name node* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
} 