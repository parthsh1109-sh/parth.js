$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$port = if ($env:PORT) { $env:PORT } else { '3000' }
$statusUrl = "http://localhost:$port/api/status"

try {
  $response = Invoke-WebRequest -Uri $statusUrl -UseBasicParsing -TimeoutSec 2
  if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
    Write-Host "Jarvis backend already running at $statusUrl"
    exit 0
  }
} catch {
  # Server is not reachable, so start it below.
}

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCommand) {
  throw 'Node.js PATH me nahi mila. Node install/PATH fix karo, phir script dobara chalao.'
}

Start-Process `
  -FilePath $nodeCommand.Source `
  -ArgumentList 'server.js' `
  -WorkingDirectory $projectRoot `
  -WindowStyle Hidden

Start-Sleep -Seconds 2

try {
  $response = Invoke-WebRequest -Uri $statusUrl -UseBasicParsing -TimeoutSec 5
  Write-Host "Jarvis backend started at $statusUrl with status $($response.StatusCode)"
} catch {
  Write-Warning "Backend start command run ho gaya, lekin status check fail hua."
}
