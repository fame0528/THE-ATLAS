# Weekly Sprint Summary — v2.0 Spencer Metrics
# Generates a comprehensive weekly review for Spencer

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace"
)

$metricsFile = Join-Path $Workspace "memory/topics/spencer-metrics.md"
$projectsFile = Join-Path $Workspace "PROJECTS.md"
$tasksFile = Join-Path $Workspace "TASKS.md"
$notesDir = Join-Path $Workspace "memory/facts"

# Get this week's metrics (spencer-metrics)
$spencerMetrics = @{ deepWorkHours = 0; dailyNoteRate = 0; bufferCompressions = 0; intrusionEvents = 0 }
if (Test-Path $metricsFile) {
    $content = Get-Content $metricsFile -Raw
    if ($content -match "Deep Work Hours:\s*([\d.]+)") { $spencerMetrics.deepWorkHours = [double]$matches[1] }
    if ($content -match "Daily Note Rate:\s*([\d.]+)%") { $spencerMetrics.dailyNoteRate = [double]$matches[1] }
    if ($content -match "Buffer Compressions:\s*(\d+)") { $spencerMetrics.bufferCompressions = [int]$matches[1] }
    if ($content -match "Intrusion Events:\s*(\d+)") { $spencerMetrics.intrusionEvents = [int]$matches[1] }
}

# Projects progress
$projectsProgress = @{}
if (Test-Path $projectsFile) {
    $projLines = Get-Content $projectsFile
    foreach ($line in $projLines) {
        if ($line -match "^##\s+(.+)$") {
            $projName = $matches[1]
            $projectsProgress[$projName] = @{
                lastActive = ""
                todo = 0
                done = 0
            }
        }
        elseif ($line -match "Last active:\s*(.+)$") {
            $projectsProgress[$projName].lastActive = $matches[1]
        }
        elseif ($line -match "Tasks:\s+(\d+)\s+todo,\s+(\d+)\s+done") {
            $projectsProgress[$projName].todo = [int]$matches[1]
            $projectsProgress[$projName].done = [int]$matches[2]
        }
    }
}

# Daily notes count this week
$weekStart = (Get-Date).AddDays(-7)
$dailyNotes = Get-ChildItem $notesDir -Filter "*.md" | Where-Object { $_.LastWriteTime -ge $weekStart }
$notesCount = $dailyNotes.Count

# Build summary
$report = @"
# 📋 Weekly Sprint Summary — $(Get-Date -Format 'yyyy-MM-dd')

**Week:** $($weekStart.ToString('MMM dd')) - $(Get-Date -Format 'MMM dd')

## Spencer Well-Being

- Deep work hours: $($spencerMetrics.deepWorkHours)
- Daily logging: $notesCount entries (goal: 7)
- Buffer compressions: $($spencerMetrics.bufferCompressions)
- Intrusion events: $($spencerMetrics.intrusionEvents)

$(if ($spencerMetrics.intrusionEvents -eq 0) { "✅ Zero intrusions — flow is respected." } else { "⚠️ Review alert thresholds." })

## Project Progress

"@

foreach ($proj in $projectsProgress.Keys) {
    $p = $projectsProgress[$proj]
    $report += "### $proj`n"
    $report += "- Last active: $($p.lastActive)`n"
    $report += "- Tasks: $($p.todo) todo, $($p.done) done`n`n"
}

$report += "## Next Week Focus`n`n"
$topProjects = $projectsProgress.GetEnumerator() | Sort-Object { $_.Value.todo } -Descending | Select-Object -First 3
foreach ($tp in $topProjects) {
    $report += "- Advance $($tp.Key) (has $($tp.Value.todo) pending tasks)`n"
}

$report += "`n— Weekly Sprint Summary v1.0"

Write-Output $report
