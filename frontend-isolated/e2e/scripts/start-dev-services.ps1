# Start Django development server
$apiPath = "../../api-isolated"
$frontendPath = "../.."

# Start Django server
Write-Host "Starting Django development server..."
$djangoProcess = Start-Process -FilePath "python" -ArgumentList "manage.py", "runserver", "8000" -WorkingDirectory $apiPath -PassThru -NoNewWindow

# Start Vite dev server
Write-Host "Starting Vite development server..."
$viteProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory $frontendPath -PassThru -NoNewWindow

# Wait for user input
Write-Host "Press any key to stop the servers..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Stop both processes
Stop-Process -Id $djangoProcess.Id -Force
Stop-Process -Id $viteProcess.Id -Force 