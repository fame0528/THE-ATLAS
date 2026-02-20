# Proactive Check-in Generator
# Spencer Proactive Agent — Context-Aware Gentle Nudges

param(
    [Parameter(Mandatory = $false)]
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace",
    
    [Parameter(Mandatory = $false)]
    [string]$TimeOfDay = "auto"  # auto, morning, afternoon, evening, night
)

$hour = (Get-Date).Hour
if ($TimeOfDay -eq "auto") {
    switch ($hour) {
        { $_ -ge 6 -and $_ -lt 12 } { $TimeOfDay = "morning" }
        { $_ -ge 12 -and $_ -lt 17 } { $TimeOfDay = "afternoon" }
        { $_ -ge 17 -and $_ -lt 21 } { $TimeOfDay = "evening" }
        default { $TimeOfDay = "night" }
    }
}

# Respect sleep schedule: no check-ins between 10 PM - 7 AM
if ($TimeOfDay -eq "night") {
    Write-Host "It's $TimeOfDay (${hour}:00). Skipping check-in per sleep schedule."
    exit 0
}

# Load recent context for personalization
$sessionState = Join-Path $Workspace "SESSION-STATE.md"
$recentActivity = "no recent activity"
if (Test-Path $sessionState) {
    $content = Get-Content $sessionState -Raw
    if ($content -match "## DECISIONS\r?\n((?:- .*\r?\n)+)") {
        $decisions = $matches[1] -split "`r`n" | Where-Object { $_ -match "- " } | Select-Object -First 3
        if ($decisions) {
            $recentActivity = "last decision: " + ($decisions[0] -replace "- ", "")
        }
    }
}

# Template selection based on context & time
$templates = @{
    morning   = @(
        "Hope you slept well! 💤 The empire awaits — anything on your mind for today?",
        "Good morning! Your proactive partner is ready. What shall we tackle today?",
        "Morning! I've got your back. Any income bot updates you'd like to review?"
    )
    afternoon = @(
        "Afternoon check-in! How's the empire building going? Need a break?",
        "You've been busy! 📈 Anything you need help with right now?",
        "Midday pause — everything running smoothly? The income bot is humming along."
    )
    evening   = @(
        "Evening wrap-up! 📝 Did you get your medicine? Ready to relax?",
        "Day's end! I'm logging today's progress. Any last-minute thoughts?",
        "Evening, Spencer. You've built something today. How do you feel about it?"
    )
}

$template = $templates[$TimeOfDay] | Get-Random

# Personalize with recent activity if available
if ($recentActivity -ne "no recent activity") {
    $template = "$template`n`nI noted that $recentActivity"
}

# Add gentle empire metrics hook if available
$metricsFile = Join-Path $Workspace "memory\topics\empire-metrics.md"
if (Test-Path $metricsFile) {
    $metrics = Get-Content $metricsFile -Raw
    if ($metrics -match "Articles published: (\d+)") {
        $count = $matches[1]
        $template = "$template`n`nWe're at **$count** articles published — every one brings us closer to revenue."
    }
}

# Send via Discord (to #atlas, Spencer's home base)
$channelId = "1471955220194918645"  # From OLYMPUS_INDEX
$message = "🕐 **Proactive Check-in** (${TimeOfDay})`n`n${template}"

# Use openclaw CLI to send (splatting pattern — matches notify_progress.ps1)
$openclawCmd = "C:\Users\spenc\AppData\Roaming\npm\openclaw.cmd"
$sendArgs = @("message", "send", "--channel", "discord", "-t", "channel:$channelId", "-m", $message)

try {
    & $openclawCmd @sendArgs 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Check-in sent ($TimeOfDay)"
    }
    else {
        Write-Warning "Failed to send check-in (exit $LASTEXITCODE)"
    }
}
catch {
    Write-Warning "Send error: $_"
}
