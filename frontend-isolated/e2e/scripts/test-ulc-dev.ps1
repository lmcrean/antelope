# Get the script's directory path
$ErrorActionPreference = "Stop"
Write-Host "Starting ULC dev test script..."

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Resolve-Path (Join-Path $scriptPath "..\..")
$apiPath = Resolve-Path (Join-Path $rootPath "..\api-isolated")

# Store process IDs for cleanup
$processIds = @()

# Cleanup function
function Cleanup {
    Write-Host "Cleaning up processes..."
    foreach ($pid in $processIds) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        } catch {
            Write-Host "Could not stop process $pid"
        }
    }
}

# Set up error handling
trap {
    Write-Host "Error occurred: $_"
    Cleanup
    exit 1
}

Write-Host "Verifying paths..."
if (-not (Test-Path $rootPath)) {
    Write-Error "Root path does not exist: $rootPath"
    exit 1
}
if (-not (Test-Path $apiPath)) {
    Write-Error "API path does not exist: $apiPath"
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
    $djangoProcess = Start-Process python -ArgumentList "manage.py", "runserver", "8000" -PassThru -NoNewWindow
    $processIds += $djangoProcess.Id
    Write-Host "Django server running with PID: $($djangoProcess.Id)"

    # Wait for Django to be ready
    $djangoReady = Wait-ForService -url "http://localhost:8000/api/health/" -serviceName "Django Server"

    if (-not $djangoReady) {
        throw "Failed to start Django server"
    }

    # Run the tests
    Write-Host "Running tests..."
    Set-Location $rootPath
    if ($env:VITEST_ARGS) {
        if ($env:VITEST_MODE -eq "watch") {
            Write-Host "Running in watch mode..."
            & npm run test $env:VITEST_ARGS
        } else {
            Write-Host "Running in single-run mode..."
            & npm run test -- $env:VITEST_ARGS --run
        }
    } else {
        throw "No test file specified in VITEST_ARGS"
    }

    Write-Host "Test run complete"
} finally {
    # Only cleanup if not in watch mode
    if ($env:VITEST_MODE -ne "watch") {
        Cleanup
    }
} 