# One-Click Discord — v2.0 Time-Savers
# Predefined Discord messages for quick posting

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace",
    [string]$Preset,
    [string]$Custom
)

$discordScript = Join-Path $Workspace "skills\spencer-proactive-agent\integrations\discord.ps1"
if (-not (Test-Path $discordScript)) {
    Write-Error "Discord integration not found"
    exit 1
}

$presets = @{
    "morning" = "Good morning team! 🌅 Ready to crush goals today."
    "lunch" = "Taking a lunch break — back in 30."
    "deep-work" = "🔴 Entering deep work mode. I'll respond after 2 hours."
    "heads-down" = "Heads down for the next 90 minutes. Emergency only."
    "done" = "✅ Task complete. Moving to next item."
    "blocked" = "🚨 Blocked: Need input on [specific thing] to proceed."
    "praise" = " shoutout to @team for the great collaboration!"
    "status" = "📊 Status: [your status update]"
}

if ($Custom) {
    $msg = $Custom
}
elseif ($Preset -and $presets.ContainsKey($Preset)) {
    $msg = $presets[$Preset]
}
else {
    Write-Host "Available presets: $($presets.Keys -join ', ')"
    Write-Host "Usage: -Preset <name> or -Custom 'your message'"
    exit 0
}

& $discordScript -Message $msg
