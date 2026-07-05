@echo off
title Saule Core Backend
cd /d "%~dp0"
echo ==========================================
echo   Starting Saule-Core Backend Server...
echo ==========================================
echo.
npm start
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Saule-Core failed to start or crashed.
)
echo.
pause
