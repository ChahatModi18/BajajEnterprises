Write-Host "==========================================" -ForegroundColor Green
Write-Host " Starting Bajaj Enterprises Frontend Store" -ForegroundColor Green
Write-Host " Localhost: http://localhost:5174/" -ForegroundColor Cyan
Write-Host " Admin URL: http://localhost:5174/admin" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Green

$frontendPath = Join-Path $PSScriptRoot "frontend"
Set-Location $frontendPath
npm run dev

