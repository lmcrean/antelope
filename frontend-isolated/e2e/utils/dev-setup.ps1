# Start both servers in parallel for development testing
$apiJob = Start-Job -FilePath "./dev-api-serve.ps1"
$frontendJob = Start-Job -FilePath "./dev-frontend-serve.ps1