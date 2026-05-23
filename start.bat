@echo off
title فنجان هادي - Local Server
cd /d "%~dp0"
echo.
echo  ========================================
echo   فنجان هادي - تشغيل السيرفر المحلي
echo  ========================================
echo.
echo  سيتم فتح الموقع على: http://localhost:8080
echo  اضغط Ctrl+C لإيقاف السيرفر
echo.
start "" "http://localhost:8080"
npx --yes serve -l 8080 .
pause
