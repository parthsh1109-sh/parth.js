$ErrorActionPreference = 'Stop'

$taskName = 'ParthJarvisBackend'
$startScript = Join-Path $PSScriptRoot 'start-backend.ps1'
$powerShell = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$startScript`""

$action = New-ScheduledTaskAction -Execute $powerShell -Argument $arguments
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -MultipleInstances IgnoreNew `
  -StartWhenAvailable

Register-ScheduledTask `
  -TaskName $taskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Description 'Starts the Parth Jarvis Node.js backend at Windows login.' `
  -Force | Out-Null

Write-Host "Scheduled Task installed: $taskName"
& $startScript
