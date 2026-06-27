@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-backend.ps1"
echo Jarvis backend is ready at http://localhost:3000/
pause
