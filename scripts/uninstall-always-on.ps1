$ErrorActionPreference = 'Stop'

$taskName = 'ParthJarvisBackend'
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if (-not $task) {
  Write-Host "Scheduled Task not found: $taskName"
  exit 0
}

Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
Write-Host "Scheduled Task removed: $taskName"
