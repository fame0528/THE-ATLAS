# Flow-Scheduler.ps1 - Kronos Core
# Determines notification permission based on flow state

$Workspace = "C:\Users\spenc\.openclaw\workspace"
$TimeZone = "Eastern Standard Time"
$QuietStart = "22:00"
$QuietEnd = "07:00"

function Get-ESTTime {
    return [System.TimeZoneInfo]::ConvertTimeFromUtc([DateTime]::UtcNow, [System.TimeZoneInfo]::FindSystemTimeZoneById($TimeZone))
}

function Is-QuietHours {
    $now = Get-ESTTime
    $timeStr = $now.ToString("HH:mm")
    if ($QuietStart -gt $QuietEnd) {
        return ($timeStr -ge $QuietStart -or $timeStr -lt $QuietEnd)
    } else {
        return ($timeStr -ge $QuietStart -and $timeStr -lt $QuietEnd)
    }
}

function Get-ContextPercent {
    $json = openclaw sessions list --limit 5 --json 2>$null
    if (-not $json) { return 0 }
    try {
        $s = $json | ConvertFrom-Json -ErrorAction Stop
        if (-not $s.sessions -or $s.sessions.Count -eq 0) { return 0 }
        $a = $s.sessions | Where-Object { $_.kind -eq "group" -and $_.key -like "*discord*" } | Select-Object -First 1
        if (-not $a) { return 0 }
        $used = $a.totalTokens; $max = $a.contextTokens
        if (-not $max -or $max -eq 0) { return 0 }
        return [math]::Round(($used / $max) * 100, 1)
    } catch {
        return 0
    }
}

function Test-DeepWork {
    $pct = Get-ContextPercent
    return ($pct -ge 60)
}

# Main
if ($args.Count -eq 0) {
    # Default: full check
    $now = Get-ESTTime
    $timeStr = $now.ToString("HH:mm")
    $isQuiet = Is-QuietHours
    $isDeep = Test-DeepWork
    $pct = Get-ContextPercent

    Write-Host "Flow Check — Time: $timeStr EST, Quiet: $isQuiet, Deep: $isDeep, Context: $pct%"

    if ($isQuiet) {
        Write-Host "DECISION: Suppress — quiet hours"
        exit 0
    }
    if ($isDeep) {
        Write-Host "DECISION: Suppress — deep work detected"
        exit 0
    }
    Write-Host "DECISION: Allow — normal flow"
    exit 1
} else {
    $mode = $args[0]
    switch ($mode) {
        "quiet-hours" {
            if (Is-QuietHours) { exit 0 } else { exit 1 }
        }
        "deep-work" {
            if (Test-DeepWork) { exit 0 } else { exit 1 }
        }
        default {
            Write-Error "Unknown mode. Use: check, quiet-hours, deep-work"
            exit 2
        }
    }
}