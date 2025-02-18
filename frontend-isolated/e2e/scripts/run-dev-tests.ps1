# Get the script's directory path
$ErrorActionPreference = "Stop"
Write-Host "Starting dev tests..."

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Resolve-Path (Join-Path $scriptPath "..\..")
$apiPath = Resolve-Path (Join-Path $rootPath "..\api-isolated")

# Start the services
Write-Host "Starting dev services..."
& "$scriptPath\start-dev-services.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to start dev services"
    exit 1
}

# Wait for services to be ready
Start-Sleep -Seconds 5

# Run the tests
Write-Host "Running Playwright tests..."
try {
    Set-Location $rootPath
    # Run tests one at a time to avoid conflicts
    Write-Host "Running dev-mode.spec.ts..."
    npx playwright test e2e/tests/dev-mode.spec.ts --headed
    if ($LASTEXITCODE -ne 0) {
        Write-Error "dev-mode.spec.ts tests failed"
        exit 1
    }

    Write-Host "Running dev-mode-jwt.spec.ts..."
    npx playwright test e2e/tests/dev-mode-jwt.spec.ts --headed
    if ($LASTEXITCODE -ne 0) {
        Write-Error "dev-mode-jwt.spec.ts tests failed"
        exit 1
    }
} catch {
    Write-Error "Error running tests: $_"
    exit 1
} finally {
    # Cleanup services
    Write-Host "Cleaning up services..."
    Get-Process -Name python* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Get-Process -Name node* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
} 