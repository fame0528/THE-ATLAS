# Wellness Harmony (PS2-compatible) — v2.0
param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace"
)

# Flow-aware: respect quiet hours and deep work
$assertFlow = Join-Path $PSScriptRoot "Assert-Flow.ps1"
if (Test-Path $assertFlow) {
    . $assertFlow
    if (-not (Test-FlowAllowed -Priority "normal" -Workspace $Workspace)) {
        exit 0
    }
}

$log = Join-Path $Workspace "memory\logs\sync-memory.log"
$careFile = $Workspace + "\memory\self-care\" + (Get-Date -Format 'yyyy-MM-dd') + ".json"

Write-Host "=== Wellness Harmony ==="

# Check memory sync recency
$lastSync = $null
if (Test-Path $log) {
    $lines = Get-Content $log
    $last = $lines | Select-String "MEMORY SYNC COMPLETE" | Select-Object -Last 1
    if ($last) {
        $ts = $last.Line.Substring(0,19)
        $lastSync = [datetime]::ParseExact($ts, "yyyy-MM-dd HH:mm:ss", $null)
    }
}

$now = Get-Date
$issues = @()

if (-not $lastSync) {
    $issues += "No memory sync activity"
} else {
    $diff = ($now - $lastSync).TotalHours
    if ($diff -gt 2) {
        $issues += "Memory sync stale: $([math]::Round($diff))h"
    }
}

# Check self-care schedule awareness
$hour = $now.Hour
if ($hour -eq 20 -or $hour -eq 21) {
    $issues += "Self-care window: suppress alerts"
}

if ($issues.Count -eq 0) {
    Write-Host "All harmonious"
} else {
    Write-Warning ("Issues: {0}" -f ($issues -join "; "))
}

# Write report
$reportDir = Join-Path $Workspace "memory\topics"
if (-not (Test-Path $reportDir)) { New-Item -ItemType Directory -Path $reportDir -Force | Out-Null }
$reportPath = Join-Path $reportDir "wellness-harmony.md"
$status = if ($issues.Count -eq 0) { "HARMONIOUS" } else { "ADJUST" }
$report = "# Wellness Harmony`nTime: " + (Get-Date -Format 'yyyy-MM-dd HH:mm') + "`nStatus: " + $status + "`n`n"
if ($issues.Count -gt 0) {
    $report += "Issues:`n" + ($issues -join "`n") + "`n`n"
    $report += "Action: Adjust proactive alerts`n"
} else {
    $report += "No conflicts detected`n"
}
$report | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "Report: $reportPath"
