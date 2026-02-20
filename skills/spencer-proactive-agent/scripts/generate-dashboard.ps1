# Generate Dashboard — v2.0 Personal Dashboard
# Creates HTML dashboard with TL;DR grid and color-coded metrics

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace",
    [string]$OutputDir = "dashboard",
    [string]$Template = "dashboard/template.html"
)

# Ensure output directory
$outDir = Join-Path $Workspace $OutputDir
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

$generatedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# 1. Gather metrics from empire-metrics.md (latest)
$metricsFile = Join-Path $Workspace "memory\topics\empire-metrics.md"
$metrics = @{
    status = "UNKNOWN"
    articles = 0
    uptime = "0%"
    errors = 0
    lastRun = "Never"
    message = "No data"
}

if (Test-Path $metricsFile) {
    $content = Get-Content $metricsFile -Raw
    if ($content -match "Status:\s*(HEALTHY|UNHEALTHY)") { $metrics.status = $matches[1] }
    if ($content -match "Articles published:\s*(\d+)") { $metrics.articles = [int]$matches[1] }
    if ($content -match "Average uptime:\s*([\d.]+)%?") { $metrics.uptime = $matches[1] + "%" }
    if ($content -match "Errors \(7d\):\s*(\d+)") { $metrics.errors = [int]$matches[1] }
    if ($content -match "Last successful run:\s*(.+)") { $metrics.lastRun = $matches[1].Trim() }
    if ($content -match "Latest message:\s*(.+)") { $metrics.message = $matches[1].Trim() }
}

# 2. Buffer status (from latest compression log)
$bufferLog = Join-Path $Workspace "memory\logs\buffer-compression.log"
$buffer = @{
    sizeKB = 0
    lastCompression = "Never"
    compressionsToday = 0
}

if (Test-Path $bufferLog) {
    $lines = Get-Content $bufferLog | Select-Object -Last 50
    $today = Get-Date -Format "yyyy-MM-dd"
    $buffer.compressionsToday = ($lines | Where-Object { $_ -match $today }).Count
    $last = $lines | Select-Object -Last 1
    if ($last -and $last -match "SESSION-STATE.md size:\s*(\d+)") {
        $buffer.sizeKB = [math]::Round([int]$matches[1] / 1024, 1)
    }
    if ($last -and $last -match "Compressed to") {
        $buffer.lastCompression = "Recent"
    }
}

# 3. Recent milestones (last 24h)
$milestoneLog = Join-Path $Workspace "memory\logs\milestone-alerts.log"
$milestones = @()
if (Test-Path $milestoneLog) {
    $cutoff = (Get-Date).AddHours(-24)
    $milestones = Get-Content $milestoneLog | Where-Object { $_ -match '^\d{4}-\d{2}-\d{2}' } | ForEach-Object {
        try {
            $ts = [datetime]::ParseExact($_.Substring(0,19), 'yyyy-MM-dd HH:mm:ss', $null)
            if ($ts -ge $cutoff) { $_ }
        } catch { }
    } | Select-Object -Last 10
}

# 4. Determine health color
$healthColor = "gray"
$healthLabel = "UNKNOWN"
if ($metrics.status -eq "HEALTHY") {
    $healthColor = "green"
    $healthLabel = "HEALTHY"
} elseif ($metrics.status -eq "UNHEALTHY") {
    $healthColor = "red"
    $healthLabel = "UNHEALTHY"
}

# 5. Build dashboard data object
$data = @{
    generatedAt = $generatedAt
    health = @{
        color = $healthColor
        label = $healthLabel
        articles = $metrics.articles
        uptime = $metrics.uptime
        errors = $metrics.errors
        lastRun = $metrics.lastRun
        message = $metrics.message
    }
    buffer = @{
        sizeKB = $buffer.sizeKB
        lastCompression = $buffer.lastCompression
        compressionsToday = $buffer.compressionsToday
    }
    milestones = $milestones
    config = @{
        quietHours = "22:00-07:00"
        flowEnabled = $true
    }
}

# 6. Render HTML from template (or generate inline)
$html = @"
<!DOCTYPE html>
<html>
<head>
    <title>Atlas Dashboard — $(Get-Date -Format 'yyyy-MM-dd')</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #0d1117; color: #c9d1d9; }
        .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px; }
        .card h3 { margin: 0 0 10px 0; font-size: 14px; color: #8b949e; text-transform: uppercase; letter-spacing: 0.5px; }
        .big { font-size: 32px; font-weight: 600; margin: 10px 0; }
        .green { color: #3fb950; }
        .red { color: #f85149; }
        .yellow { color: #d29922; }
        .gray { color: #8b949e; }
        .meta { font-size: 12px; color: #8b949e; }
        ul { list-style: none; padding: 0; margin: 0; }
        li { padding: 8px 0; border-bottom: 1px solid #30363d; }
        li:last-child { border-bottom: none; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-right: 8px; }
        .badge-green { background: #238636; color: white; }
        .badge-yellow { background: #9e6a03; color: white; }
        .badge-red { background: #da3633; color: white; }
    </style>
</head>
<body>
    <h1 style="margin: 0 0 20px 0;">Atlas Dashboard — $(Get-Date -Format 'MMM dd, yyyy')</h1>
    <p class="meta">Generated at $generatedAt</p>

    <div class="grid">
        <!-- Empire Health -->
        <div class="card">
            <h3>Empire Health</h3>
            <div class="big $($healthColor)">
                <span class="badge badge-$healthColor">$healthLabel</span>
            </div>
            <p>Articles: $($metrics.articles)</p>
            <p>Uptime: $($metrics.uptime)</p>
            <p>Errors (24h): $($metrics.errors)</p>
            <p class="meta">Last run: $($metrics.lastRun)</p>
        </div>

        <!-- Buffer -->
        <div class="card">
            <h3>Working Buffer</h3>
            <div class="big">$($buffer.sizeKB) KB</div>
            <p>Compressions today: $($buffer.compressionsToday)</p>
            <p class="meta">$($buffer.lastCompression)</p>
        </div>

        <!-- Flow -->
        <div class="card">
            <h3>Flow State</h3>
            <div class="big green">ACTIVE</div>
            <p>Quiet hours: $($data.config.quietHours)</p>
            <p>Adaptive scheduling: ON</p>
            <p>Deep work detection: ON</p>
        </div>
    </div>

    <div class="card">
        <h3>Recent Milestones (24h)</h3>
        $(
            if ($milestones.Count -eq 0) {
                '<p class="meta">No milestones detected.</p>'
            } else {
                $items = foreach ($m in $milestones) {
                    $ts = $m.Substring(0,19)
                    $msg = $m.Substring(20).Trim()
                    "<li><span class='badge badge-yellow'>$ts</span> $msg</li>"
                }
                "<ul>" + ($items -join '') + "</ul>"
            }
        )
    </div>

    <p class="meta" style="margin-top: 20px; font-size: 11px;">Proactive Agent v2.0 — Invisible Assistant & Flow-Aware Scheduling</p>
</body>
</html>
"@

$outFile = Join-Path $outDir "latest.html"
$html | Out-File -FilePath $outFile -Encoding UTF8

Write-Host "Dashboard generated: $outFile"
Write-Output $generatedAt
