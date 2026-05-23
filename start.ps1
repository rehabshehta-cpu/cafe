Set-Location $PSScriptRoot
Write-Host ""
Write-Host "  فنجان هادي - تشغيل السيرفر المحلي" -ForegroundColor Cyan
Write-Host "  http://localhost:8080" -ForegroundColor Green
Write-Host ""
Start-Process "http://localhost:8080"
npx --yes serve -l 8080 .
