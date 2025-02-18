# Navigate to frontend-isolated root
$projectRoot = Join-Path $PSScriptRoot "../../../../../"
Set-Location $projectRoot

# Define test file path
$testFile = "src/components/TestButtons/UserLifecycle/__tests__/ulc-dev.spec.ts"

# Verify test file exists
if (-not (Test-Path $testFile)) {
    Write-Error "Test file not found: $testFile"
    exit 1
}

# Start dev services
Write-Host "Starting dev services..."
& "$projectRoot/scripts/start-dev.ps1"

# Run the test
Write-Host "Running ULC tests..."
npx playwright test $testFile --headed 