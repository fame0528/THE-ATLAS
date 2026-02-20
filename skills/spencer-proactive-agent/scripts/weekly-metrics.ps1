# Weekly Metrics Summary — v2.0
# Compiles empire progress report from last 7 days and posts to #atlas

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace"
)

# Flow-aware: respect quiet hours and deep work (high priority since weekly)
$assertFlow = Join-Path $PSScriptRoot "Assert-Flow.ps1"
if (Test-Path $assertFlow) {
    . $assertFlow
    if (-not (Test-FlowAllowed -Priority "high" -Workspace $Workspace)) {
        exit 0
    }
}

$metricsFile = Join-Path $Workspace "memory\topics\empire-metrics.md"
if (-not (Test-Path $metricsFile)) {
    Write-Output "📊 Weekly Metrics: No metrics data available yet."
    exit 0
}

# Read last 7 days of metrics (look for daily entries in memory/topics/empire-metrics/)
$metricsDir = Join-Path $Workspace "memory\topics"
$files = Get-ChildItem $metricsDir -Filter "empire-metrics-*.md" | 
    Where-Object { $_.LastWriteTime -ge (Get-Date).AddDays(-7) } |
    Sort-Object LastWriteTime

if ($files.Count -eq 0) {
    Write-Output "📊 Weekly Metrics: No daily metrics files found for last 7 days."
    exit 0
}

# Simple aggregation (count articles, compute uptime)
$totalArticles = 0
$uptimeSum = 0
$errorCount = 0

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    if ($content -match "Articles Published:\s*(\d+)") { $totalArticles += [int]$matches[1] }
    if ($content -match "Uptime %:\s*([\d.]+)") { $uptimeSum += [double]$matches[1] }
    if ($content -match "Errors \(24h\):\s*(\d+)") { $errorCount += [int]$matches[1] }
}

$avgUptime = [math]::Round($uptimeSum / $files.Count, 2)
$days = $files.Count

$report = @"
## 📊 Weekly Empire Metrics — $((Get-Date).ToString('MMM dd'))

**Period:** Last $days days

- ✅ **Articles published:** $totalArticles
- ⏱ **Average uptime:** $avgUptime%
- ❌ **Errors (7d):** $errorCount

**3 Actionable Suggestions:**
1. Review error trends in `memory/logs/`
2. Check income_bot health if uptime < 99%
3. Plan next week's content pipeline

— Proactive Agent
"@

Write-Output $report
