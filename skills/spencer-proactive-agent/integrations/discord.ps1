# Discord Integration (Simple, PS2-compatible)
# Spencer Proactive Agent — Sends alerts to #atlas

param(
    [Parameter(Mandatory = $true)]
    [string]$Message,
    
    [Parameter(Mandatory = $false)]
    [ValidateSet("info", "warning", "success", "error")]
    [string]$Level = "info"
)

# Spencer's home base channel ID (from OLYMPUS_INDEX)
$channelId = "1471955220194918645"

$emoji = "INFO"
if ($Level -eq "warning") { $emoji = "WARN" }
if ($Level -eq "success") { $emoji = "OK" }
if ($Level -eq "error") { $emoji = "ERR" }

$formattedMessage = "${emoji} Proactive Agent - ${Message}"

$openclawCmd = "C:\Users\spenc\AppData\Roaming\npm\openclaw.cmd"
$sendArgs = @("message", "send", "--channel", "discord", "-t", "channel:$channelId", "-m", $formattedMessage)

Write-Host "Sending to #atlas..."
try {
    & $openclawCmd @sendArgs 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Notification delivered"
    }
    else {
        Write-Warning "Failed to send (exit $LASTEXITCODE)"
    }
}
catch {
    Write-Warning "Send error: $_"
}
