# Compress-Buffer.ps1 - v2.0 Invisible Assistant
# Compress SESSION-STATE.md when it exceeds threshold

param(
    [int]$ThresholdBytes = 200000,
    [string]$Workspace = "C:\\Users\\spenc\\.openclaw\\workspace"
)

$SessionFile = Join-Path $Workspace "SESSION-STATE.md"
$SummaryFile = Join-Path $Workspace "memory\\topics\\active-session.md"
$KeepLines = 50
$LogDir = Join-Path $Workspace "memory\\logs"
$LogFile = Join-Path $LogDir "buffer-compression.log"

function Write-Log($msg) {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$ts] COMPRESS: $msg"
}

# Check session file exists
if (-not (Test-Path $SessionFile)) {
    Write-Log "SESSION-STATE.md not found"
    exit 1
}

$fileInfo = Get-Item $SessionFile

# Check size threshold
if ($fileInfo.Length -le $ThresholdBytes) {
    Write-Log "Size $($fileInfo.Length) <= threshold $ThresholdBytes - skipping"
    exit 0
}

Write-Log "Size $($fileInfo.Length) > $ThresholdBytes - compressing"

# Ensure summary directory
$summaryDir = Split-Path $SummaryFile -Parent
if (-not (Test-Path $summaryDir)) {
    New-Item -ItemType Directory -Path $summaryDir -Force | Out-Null
}

# Read content
$content = Get-Content $SessionFile -Raw
$lines = $content -split "`n"

# Build summary
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$summary = "# Buffer Compression Summary - $timestamp`n"
$summary += "**Original size:** $($fileInfo.Length) bytes`n"
$summary += "**Compressed to:** last $KeepLines lines`n`n"
$summary += "## Recent Decisions`n"

$patterns = 'decide','choose','select','use','implement','fix','change','update','create','add','build','deploy'
$decisions = @()
foreach ($line in $lines) {
    $lower = $line.ToLower()
    foreach ($p in $patterns) {
        if ($lower.Contains($p)) {
            $decisions += $line
            break
        }
    }
}
$decisions = $decisions | Select-Object -Last 10
if ($decisions) {
    foreach ($d in $decisions) { $summary += "- $d`n" }
} else {
    $summary += "- No decisions detected`n"
}

$summary += "`n## Current Task`n"
$match = [regex]::Match($content, '(?i)current task[:\s]*([^\r\n]+)')
if ($match.Success) { $summary += $match.Groups[1].Value.Trim() + "`n" } else { $summary += "- Not specified`n" }

$summary += "`n## Recent Metrics`n"
$metrics = @()
$metricPatterns = 'articles','systems','income','daily note','overflow','deep work','milestone','streak'
foreach ($line in $lines) {
    $lower = $line.ToLower()
    foreach ($p in $metricPatterns) {
        if ($lower.Contains($p)) {
            $metrics += $line
            break
        }
    }
}
$metrics = $metrics | Select-Object -Last 10
if ($metrics) {
    foreach ($m in $metrics) { $summary += "- $m`n" }
} else {
    $summary += "- No metrics detected`n"
}

# Save summary
Add-Content -Path $SummaryFile -Value $summary -Encoding UTF8
Write-Log "Summary saved: $SummaryFile"

# Compress buffer
$lastLines = $lines | Select-Object -Last $KeepLines
$compressed = $lastLines -join "`n"
$compressedSize = $compressed.Length

Set-Content -Path $SessionFile -Value $compressed -Encoding UTF8
Write-Log "Compressed to $($lastLines.Count) lines ($compressedSize bytes)"

# Log event
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
$logEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | BUFFER_COMPRESS | Original: $($fileInfo.Length) -> Compressed: $compressedSize | Summary: $SummaryFile`n"
Add-Content -Path $LogFile -Value $logEntry -Encoding UTF8

Write-Log "SUCCESS"
exit 0