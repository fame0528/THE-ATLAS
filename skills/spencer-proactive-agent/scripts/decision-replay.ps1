# Decision Replay — v2.0 Memory Companion
# When a file is revisited after >24h, show previous decisions related to it

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace",
    [string]$TargetFile  # file path relative to workspace
)

if (-not $TargetFile) {
    Write-Error "Usage: decision-replay.ps1 -TargetFile <path>"
    exit 1
}

$fullPath = Join-Path $Workspace $TargetFile
if (-not (Test-Path $fullPath)) {
    Write-Error "File not found: $TargetFile"
    exit 1
}

$lastAccess = (Get-Item $fullPath).LastWriteTime
$now = Get-Date
$hoursSince = ($now - $lastAccess).TotalHours

if ($hoursSince -lt 24) {
    Write-Verbose "File accessed recently ($([math]::Round($hoursSince,1))h ago). No replay needed."
    exit 0
}

# Search SESSION-STATE.md for mentions of this file
$sessionFile = Join-Path $Workspace "SESSION-STATE.md"
if (-not (Test-Path $sessionFile)) {
    Write-Verbose "No session state found."
    exit 0
}

$filename = Split-Path $TargetFile -Leaf
$matches = Select-String -Path $sessionFile -Pattern [regex]::Escape($filename) | Select-Object -Last 5

if ($matches.Count -eq 0) {
    Write-Output "No previous decisions found for $filename."
    exit 0
}

$report = @"
## 🔄 Decision Replay — $filename

Last modified: $($lastAccess.ToString('yyyy-MM-dd HH:mm'))
Hours since: $([math]::Round($hoursSince,1))

**Previous mentions in session context:**
"@

foreach ($m in $matches) {
    $line = $m.Line.Trim()
    $ts = $m.Line.Substring(0,19)
    $report += "`n- [$ts] $line"
}

$report += "`n`n— Memory Companion v1.0"

Write-Output $report
