# Daily Note Check — v2.0
# Checks if yesterday's daily note exists; sends gentle reminder if missing

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace"
)

# Flow-aware: respect quiet hours and deep work
$assertFlow = Join-Path $PSScriptRoot "Assert-Flow.ps1"
if (Test-Path $assertFlow) {
    . $assertFlow
    if (-not (Test-FlowAllowed -Priority "normal" -Workspace $Workspace)) {
        exit 0  # Silently skip due to flow state
    }
}

$memoryDir = Join-Path $Workspace "memory\facts"
$yesterday = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd")
$expectedFile = Join-Path $memoryDir "$yesterday.md"

if (-not (Test-Path $expectedFile)) {
    $message = "Good morning! We didn't log yesterday. Quick recap?"
    # Send to #atlas via Discord integration
    $discord = Join-Path $Workspace "skills\spencer-proactive-agent\integrations\discord.ps1"
    if (Test-Path $discord) {
        & $discord -Message $message
    }
    else {
        Write-Output $message  # Cron will deliver
    }
}
else {
    Write-Verbose "Daily note exists: $yesterday"
}
