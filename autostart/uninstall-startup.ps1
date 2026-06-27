$ErrorActionPreference = "Stop"

$startupFolder = [Environment]::GetFolderPath("Startup")
$shortcutPath = Join-Path $startupFolder "Parth Jarvis Backend.lnk"

if (Test-Path -LiteralPath $shortcutPath) {
  Remove-Item -LiteralPath $shortcutPath -Force
  Write-Host "Jarvis backend autostart removed."
} else {
  Write-Host "Jarvis backend autostart was not installed."
}
