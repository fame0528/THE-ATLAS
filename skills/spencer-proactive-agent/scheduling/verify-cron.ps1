# Verify Cron Jobs
# Spencer Proactive Agent — Check installation status

$expectedLabels = @(
    "proactive-working-buffer",
    "proactive-empire-health",
    "proactive-daily-note-check",
    "proactive-weekly-metrics",
    "proactive-monthly-review",
    "proactive-buffer-rotate",
    "proactive-wellness-harmony"
)

try {
    $jsonOutput = openclaw cron list --json 2>$null
    $allJobs = $jsonOutput | ConvertFrom-Json
} catch {
    Write-Warning "Failed to get cron list as JSON. Falling back to text parsing."
    $allJobs = @()
}

Write-Host "=== Proactive Agent Cron Status ==="
Write-Host ""

foreach ($label in $expectedLabels) {
    $job = $allJobs | Where-Object { $_.label -eq $label } | Select-Object -First 1
    
    if ($job) {
        $status = if ($job.enabled) { "🟢 ENABLED" } else { "🔴 DISABLED" }
        $nextRun = if ($job.nextRunAtMs) { [datetime]::FromFileTimeUtc($job.nextRunAtMs).ToString("yyyy-MM-dd HH:mm") } else { "scheduling..." }
        Write-Host "$status $label"
        Write-Host "   Next: $nextRun"
        Write-Host "   Schedule: $($job.schedule.expr)"
    } else {
        Write-Host "❌ MISSING $label"
    }
    Write-Host ""
}

$found = ($allJobs | Where-Object { $_.label -in $expectedLabels }).Count
Write-Host "Found $found/7 expected jobs."

if ($found -eq 7) {
    Write-Host "✅ All jobs present." -ForegroundColor Green
} else {
    Write-Host "⚠️ Some jobs missing. Re-run .\install-cron.ps1" -ForegroundColor Yellow
}
