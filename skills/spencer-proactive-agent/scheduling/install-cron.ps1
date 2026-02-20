# Install Cron Jobs
$jobDefsFile = "C:\Users\spenc\.openclaw\workspace\skills\spencer-proactive-agent\scheduling\cron-jobs.json"
if (-not (Test-Path $jobDefsFile)) { Write-Error "cron-jobs.json missing"; exit 1 }

$jobs = (Get-Content $jobDefsFile -Raw) | ConvertFrom-Json
$installed = 0; $skipped = 0

Write-Host "Installing proactive agent cron jobs..."
foreach ($job in $jobs.jobs) {
    # Check existing
    $exists = openclaw cron list | Select-String $job.name
    if ($exists) { Write-Host "⏭️  $($job.name) exists"; $skipped++; continue }

    # Schedule
    if ($job.schedule.kind -eq "cron") {
        $cron = $job.schedule.expr
        if ($job.schedule.tz) { $tz = "--tz " + $job.schedule.tz } else { $tz = "" }
    } else {
        $mins = [math]::Round($job.schedule.everyMs / 60000)
        $cron = "*/$mins * * * *"
        $tz = ""
    }

    $msg = $job.payload.message
    $cmd = "openclaw cron add --name `"$($job.name)`" --cron `"$cron`" $tz --agent main --session $($job.sessionTarget) -m `"$msg`""
    Write-Host "🆕 $($job.name)"
    cmd /c $cmd
    if ($LASTEXITCODE -eq 0) { $installed++; Write-Host "   ✅" } else { Write-Host "   ❌" }
}
Write-Host "Installed: $installed, Skipped: $skipped"
