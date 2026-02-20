# Experiment Runner — v2.0 Spencer Metrics
# Manages and evaluates micro-experiments

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace",
    [string]$ConfigPath = "config/experiments.json"
)

$configFile = Join-Path $Workspace $ConfigPath
if (-not (Test-Path $configFile)) {
    Write-Error "Experiments config not found: $ConfigPath"
    exit 1
}

$experiments = Get-Content $configFile -Raw | ConvertFrom-Json

$report = "# 🧪 Experiment Status — $(Get-Date -Format 'yyyy-MM-dd')`n`n"

foreach ($exp in $experiments) {
    $report += "## $($exp.name)`n"
    $report += "**Hypothesis:** $($exp.hypothesis)`n"
    $report += "**Success Metric:** $($exp.metric)`n"
    $report += "**Target:** $($exp.target)`n"
    
    # Evaluate current value (simplified: read from metrics file)
    $metricsFile = Join-Path $Workspace "memory/topics/spencer-metrics.md"
    $current = "N/A"
    if (Test-Path $metricsFile) {
        $content = Get-Content $metricsFile -Raw
        if ($content -match "$($exp.metric):\s*([\d.]+)") {
            $current = $matches[1]
        }
    }
    
    $report += "**Current:** $current`n"
    $report += "**Status:** $(if ($current -ge $exp.target) { '✅ ON TRACK' } else { '⏳ IN PROGRESS' })`n`n"
}

Write-Output $report
