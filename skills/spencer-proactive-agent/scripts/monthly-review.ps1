# Monthly Review — v2.0
# Month-in-review with trend analysis and forward look

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace"
)

# Flow-aware: high priority (monthly), but still respect quiet hours
$assertFlow = Join-Path $PSScriptRoot "Assert-Flow.ps1"
if (Test-Path $assertFlow) {
    . $assertFlow
    if (-not (Test-FlowAllowed -Priority "high" -Workspace $Workspace)) {
        exit 0
    }
}

$metricsDir = Join-Path $Workspace "memory\topics"
$currentMonth = Get-Date.ToString("yyyy-MM")
$lastMonth = (Get-Date).AddMonths(-1).ToString("yyyy-MM")

# Get last month's files
$lastMonthFiles = Get-ChildItem $metricsDir -Filter "empire-metrics-*.md" | 
    Where-Object { $_.LastWriteTime.ToString("yyyy-MM") -eq $lastMonth } |
    Sort-Object LastWriteTime

if ($lastMonthFiles.Count -eq 0) {
    Write-Output "🗓 Monthly Review: No metrics data for $lastMonth yet."
    exit 0
}

# Aggregate last month
$lastArticles = 0; $lastUptimeSum = 0; $lastErrors = 0
foreach ($file in $lastMonthFiles) {
    $content = Get-Content $file -Raw
    if ($content -match "Articles Published:\s*(\d+)") { $lastArticles += [int]$matches[1] }
    if ($content -match "Uptime %:\s*([\d.]+)") { $lastUptimeSum += [double]$matches[1] }
    if ($content -match "Errors \(24h\):\s*(\d+)") { $lastErrors += [int]$matches[1] }
}
$lastAvgUptime = [math]::Round($lastUptimeSum / $lastMonthFiles.Count, 2)

# Compare to previous month (if any)
$prevMonth = (Get-Date).AddMonths(-2).ToString("yyyy-MM")
$prevMonthFiles = Get-ChildItem $metricsDir -Filter "empire-metrics-*.md" | 
    Where-Object { $_.LastWriteTime.ToString("yyyy-MM") -eq $prevMonth }

$prevArticles = $null; $prevUptime = $null
if ($prevMonthFiles.Count -gt 0) {
    foreach ($file in $prevMonthFiles) {
        $content = Get-Content $file -Raw
        if ($content -match "Articles Published:\s*(\d+)") { $prevArticles += [int]$matches[1] }
        if ($content -match "Uptime %:\s*([\d.]+)") { $prevUptime += [double]$matches[1] }
    }
    if ($null -ne $prevUptime -and $prevMonthFiles.Count -gt 0) {
        $prevUptime = [math]::Round($prevUptime / $prevMonthFiles.Count, 2)
    }
}

# Build report
$report = @"
## 🗓 Monthly Review — $lastMonth

**Last Month Summary:**
- 📝 Articles: $lastArticles
- ⏱ Avg Uptime: $lastAvgUptime%
- ❌ Errors: $lastErrors

$(if ($null -ne $prevArticles) { "**Trend (vs $prevMonth):**`n- Articles: $($lastArticles - $prevArticles)`n- Uptime: $($lastAvgUptime - $prevUptime)%`n" else { "" })

**Reflection Questions:**
1. What went well this month?
2. What needs adjustment for next month?
3. Are we on track with annual goals?

**Next Month Focus:**
- Maintain uptime above 99%
- Increase content output by 10%
- Reduce errors by 20%

— Proactive Agent
"@

Write-Output $report
