# Uninstall Cron Jobs
# Spencer Proactive Agent — Removes all scheduled tasks

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
    Write-Warning "Could not get JSON cron list. Trying plain list..."
    $allJobs = @()
}

if ($allJobs.Count -eq 0) {
    # Fallback: parse table
    $lines = openclaw cron list 2>$null
    foreach ($line in $lines) {
        if ($line -match "^\s*(\S+)\s+(\S+.*?\S)\s+") {
            $id = $matches[1]
            $rest = $line.Substring($matches[0].Length).Trim()
            # Crude parsing: second column is name
            $name = $rest -split "\s{2,}" | Select-Object -First 1
            if ($expectedLabels -contains $name) {
                $allJobs += [PSCustomObject]@{ id = $id; name = $name }
            }
        }
    }
}

$toRemove = $allJobs | Where-Object { $expectedLabels -contains $_.name }

Write-Host "=== Uninstalling Proactive Agent Cron Jobs ==="
Write-Host ""

if ($toRemove.Count -eq 0) {
    Write-Host "No proactive agent jobs found. Already removed?" -ForegroundColor Yellow
    exit 0
}

foreach ($job in $toRemove) {
    Write-Host "Removing: $($job.label) ($($job.id))"
    openclaw cron remove --id $job.id 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Removed" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Failed (exit $LASTEXITCODE)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Removal complete. All proactive agent cron jobs disabled."
