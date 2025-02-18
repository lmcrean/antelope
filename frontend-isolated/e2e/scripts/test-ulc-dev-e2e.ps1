# Get the script's directory path
$ErrorActionPreference = "Stop"
Write-Host "Starting ULC E2E dev test script..."

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Resolve-Path (Join-Path $scriptPath "..\..")
$apiPath = Resolve-Path (Join-Path $rootPath "..\api-isolated")

# Store process IDs for cleanup
$processIds = @()

# Cleanup function
function Cleanup {
    Write-Host "Cleaning up processes..."
    foreach ($processId in $processIds) {
        try {
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        } catch {
            Write-Host "Could not stop process $processId"
        }
    }
}

# Set up error handling
trap {
    Write-Host "Error occurred: $_"
    Cleanup
    exit 1
}

# Function to wait for a service to be ready
function Wait-ForService {
    param (
        [string]$url,
        [int]$timeoutSeconds = 30,
        [string]$serviceName
    )
    
    Write-Host "Waiting for $serviceName to be ready at $url..."
    $start = Get-Date
    
    while ($true) {
        try {
            $response = Invoke-WebRequest -Uri $url -Method GET -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host "$serviceName is ready!"
                return $true
            }
        } catch {
            $elapsed = (Get-Date) - $start
            if ($elapsed.TotalSeconds -gt $timeoutSeconds) {
                Write-Error "$serviceName did not become ready within $timeoutSeconds seconds"
                return $false
            }
        }
        Start-Sleep -Seconds 1
    }
}

try {
    # Start Django server
    Write-Host "Starting Django server..."
    Set-Location $apiPath
    
    # Activate virtual environment and set Django settings
    $env:DJANGO_SETTINGS_MODULE = "api_project.settings"
    & "$apiPath\venv\Scripts\Activate.ps1"
    
    $djangoProcess = Start-Process python -ArgumentList "manage.py", "runserver", "8000" -PassThru -NoNewWindow
    $processIds += $djangoProcess.Id
    Write-Host "Django server running with PID: $($djangoProcess.Id)"

    # Wait for Django to be ready
    $djangoReady = Wait-ForService -url "http://localhost:8000/api/health/" -serviceName "Django Server"
    if (-not $djangoReady) {
        throw "Failed to start Django server"
    }

    # Start Vite dev server
    Write-Host "Starting Vite dev server..."
    Set-Location $rootPath
    $viteProcess = Start-Process npm -ArgumentList "run", "dev" -PassThru -NoNewWindow
    $processIds += $viteProcess.Id
    Write-Host "Vite dev server running with PID: $($viteProcess.Id)"

    # Wait for Vite to be ready
    $viteReady = Wait-ForService -url "http://localhost:3001" -serviceName "Vite Dev Server" -timeoutSeconds 60
    if (-not $viteReady) {
        throw "Failed to start Vite dev server"
    }

    # Run the Playwright test
    Write-Host "Running Playwright E2E tests..."
    Set-Location $rootPath
    & npx playwright test e2e/ulc-dev.spec.ts --headed

    Write-Host "Test run complete"
} finally {
    Cleanup
} 