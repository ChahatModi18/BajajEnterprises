Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Starting Bajaj Enterprises Backend API" -ForegroundColor Cyan
Write-Host " URL: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host " Docs: http://127.0.0.1:8000/api/v1/docs" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

$backendPath = Join-Path $PSScriptRoot "backend"
$venvPython = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
    $venvPython = "python"
}

Set-Location $backendPath
& $venvPython -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

