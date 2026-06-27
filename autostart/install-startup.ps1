$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$launcherPath = Join-Path $scriptDir "start-jarvis-hidden.vbs"
$startupFolder = [Environment]::GetFolderPath("Startup")
$shortcutPath = Join-Path $startupFolder "Parth Jarvis Backend.lnk"

if (-not (Test-Path -LiteralPath $launcherPath)) {
  throw "Launcher not found: $launcherPath"
}

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $launcherPath
$shortcut.WorkingDirectory = Split-Path -Parent $scriptDir
$shortcut.IconLocation = "$env:SystemRoot\System32\shell32.dll,220"
$shortcut.Description = "Starts Parth Jarvis backend on Windows login."
$shortcut.Save()

Write-Host "Jarvis backend autostart installed."
Write-Host "Shortcut: $shortcutPath"
Write-Host "It will start automatically after your next Windows login."
