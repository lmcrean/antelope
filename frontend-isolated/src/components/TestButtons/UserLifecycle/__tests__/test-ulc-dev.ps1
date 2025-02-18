# Start dev services if needed
Write-Host "Starting dev services..."
& "./scripts/start-dev.ps1"

# Run the test
Write-Host "Running ULC tests..."
npx playwright test ./src/components/TestButtons/UserLifecycle/__tests__/ulc-dev.spec.ts --headed 