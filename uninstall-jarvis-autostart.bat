@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0autostart\uninstall-startup.ps1"
echo.
echo Jarvis backend autostart removed.
pause
