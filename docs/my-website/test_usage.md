# Running Tests

This document explains how to run the various tests in the project.

## End-to-End (E2E) Tests

### Development Mode Tests

To run the development mode tests, which test the application with live servers, you can use either npm or PowerShell directly:

Using npm:
```bash
cd frontend-isolated
npm run test:e2e:dev
```

Using PowerShell directly:
```powershell
cd frontend-isolated
./e2e/scripts/run-dev-tests.ps1
```

This will:
1. Clean up any existing test processes
2. Start the Django API server on port 8000
3. Start the Vite dev server on port 3001
4. Run the Playwright tests in headed mode
5. Clean up all processes when done

### Debugging Tests

For debugging the development mode tests:

```bash
cd frontend-isolated
npm run test:e2e:dev:debug
```

This will:
1. Start the required services
2. Launch the test in debug mode with the Playwright inspector

### View Test Results

After running the tests, you can view the HTML report:

```bash
cd frontend-isolated
npx playwright show-report
```

## Available Test Commands

The following npm scripts are available for testing:

- `npm run test:e2e:dev`: Run development mode tests with live servers
- `npm run test:e2e:dev:debug`: Debug development mode tests
- `npm run test:e2e`: Run all E2E tests
- `npm run test:e2e:ui`: Run tests with Playwright UI
- `npm run test:e2e:prod`: Run production E2E tests (skips dev servers)

## Test Scripts

The project includes several PowerShell scripts for test automation:

- `frontend-isolated/e2e/scripts/run-dev-tests.ps1`: Main script to run development mode tests
- `frontend-isolated/e2e/scripts/start-dev-services.ps1`: Helper script to start required services

### Manual Service Management

If you need to start the services without running tests (for development):

```powershell
cd frontend-isolated
./e2e/scripts/start-dev-services.ps1
```

To stop the services manually:
```powershell
# Replace [DJANGO_PID] and [VITE_PID] with the actual process IDs shown in the console
Get-Process -Id [DJANGO_PID],[VITE_PID] | Stop-Process -Force
```

Or to stop all related processes:
```powershell
Get-Process -Name python* | Stop-Process -Force
Get-Process -Name node* | Stop-Process -Force
```

## Test Structure

- Development mode tests are located in `frontend-isolated/e2e/tests/`
- The main development mode test file is `dev-mode.spec.ts`
- Tests use Playwright for browser automation
- Tests verify both frontend and API functionality
- Network requests and responses are monitored and logged

## Requirements

- PowerShell
- Node.js
- Python with Django
- Playwright browsers installed (`npx playwright install`) 