@echo on
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0autostart\install-startup.ps1"
echo.
echo Jarvis backend autostart installer finished.
pause
