# Rhythm Intelligence — v2.0 Phase 2
# Passive learning of Spencer's daily patterns and rhythm mapping

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace",
    [int]$ObservationDays = 7
)

$memoryDir = Join-Path $Workspace "memory\facts"
$stateDir = Join-Path $Workspace "memory\topics"
$stateFile = Join-Path $stateDir "rhythm-state.json"

# Initialize or load state
$state = @{
    updatedAt = (Get-Date).ToString("o")
    observations = @()
    rhythmMap = @{
        morning = @{ start = ""; end = ""; typicalTasks = @(); energy = "unknown" }
        midMorning = @{ start = ""; end = ""; typicalTasks = @(); energy = "unknown" }
        afternoon = @{ start = ""; end = ""; typicalTasks = @(); energy = "unknown" }
        evening = @{ start = ""; end = ""; typicalTasks = @(); energy = "unknown" }
    }
    patterns = @{
        deepWorkWindow = @()
        notificationSilence = @()
        peakEnergy = @()
    }
}

if (Test-Path $stateFile) {
    try {
        $saved = Get-Content $stateFile -Raw | ConvertFrom-Json
        $state = $saved
    } catch { }
}

# Collect recent daily notes (last N days)
$cutoff = (Get-Date).AddDays(-$ObservationDays)
$notes = Get-ChildItem $memoryDir -Filter "*.md" | Where-Object { $_.LastWriteTime -ge $cutoff }

$observations = @()
foreach ($note in $notes) {
    $date = $note.BaseName  # yyyy-MM-dd
    $content = Get-Content $note.FullName -Raw

    # Extract time blocks: look for timestamps and task markers
    $lines = Get-Content $note.FullName
    $timeBlocks = @()
    foreach ($line in $lines) {
        if ($line -match "^##\s+(\d{1,2}):(\d{2})") {
            $hour = [int]$matches[1]
            $minute = [int]$matches[2]
            $timeBlocks += [pscustomobject]@{
                Hour = $hour
                Minute = $minute
                Tag = $line
            }
        }
    }

    # Classify into rhythm segments
    $obs = [pscustomobject]@{
        Date = $date
        TotalTasks = ($content -match "^- \[.\]").Count
        TimeBlocks = $timeBlocks
    }
    $observations += $obs
}

$state.observations = $observations

# Infer rhythm map from patterns
if ($observations.Count -ge 3) {
    # Determine typical morning (6-9), mid-morning (9-12), afternoon (12-17), evening (17-22)
    $segments = @{
        "morning" = @(6,9)
        "midMorning" = @(9,12)
        "afternoon" = @(12,17)
        "evening" = @(17,22)
    }

    foreach ($seg in $segments.Keys) {
        $startHour = $segments[$seg][0]
        $endHour = $segments[$seg][1]
        $segTasks = @()
        $energyScores = @()

        foreach ($obs in $observations) {
            $segBlock = $obs.TimeBlocks | Where-Object { $_.Hour -ge $startHour -and $_.Hour -lt $endHour }
            if ($segBlock.Count -gt 0) {
                $segTasks += $segBlock.Tag
                # Energy heuristic: more tasks => higher energy? simplistic
                $energyScores += $segBlock.Count
            }
        }

        if ($segTasks.Count -gt 0) {
            $state.rhythmMap[$seg].start = "{0:00}:00" -f $startHour
            $state.rhythmMap[$seg].end = "{0:00}:00" -f $endHour
            $state.rhythmMap[$seg].typicalTasks = $segTasks | Select-Object -First 5
            $avgEnergy = [math]::Round(($energyScores | Measure-Object -Average).Average, 1)
            $state.rhythmMap[$seg].energy = if ($avgEnergy -ge 5) { "high" } elseif ($avgEnergy -ge 2) { "medium" } else { "low" }
        }
    }

    # Detect deep work window (longest contiguous high-energy block)
    # Simplified: if morning has high energy and >5 tasks, that's deep work
    if ($state.rhythmMap.morning.energy -eq "high") {
        $state.patterns.deepWorkWindow = @($state.rhythmMap.morning.start, "12:00")
    } elseif ($state.rhythmMap.midMorning.energy -eq "high") {
        $state.patterns.deepWorkWindow = @($state.rhythmMap.midMorning.start, "14:00")
    }

    # Detect notification silence (likely night)
    $state.patterns.notificationSilence = @("22:00", "07:00")
}

# Save state
$state | ConvertTo-Json -Depth 5 | Set-Content -Path $stateFile -Encoding UTF8

# Output summary for cron delivery
$report = @"
## 📈 Daily Rhythm Map — Generated $(Get-Date -Format 'yyyy-MM-dd')

**Observation period:** Last $ObservationDays days ($($observations.Count) notes)

**Rhythm Segments:**
- Morning ($($state.rhythmMap.morning.start) - $($state.rhythmMap.morning.end)): Energy = $($state.rhythmMap.morning.energy)
- Mid-Morning ($($state.rhythmMap.midMorning.start) - $($state.rhythmMap.midMorning.end)): Energy = $($state.rhythmMap.midMorning.energy)
- Afternoon ($($state.rhythmMap.afternoon.start) - $($state.rhythmMap.afternoon.end)): Energy = $($state.rhythmMap.afternoon.energy)
- Evening ($($state.rhythmMap.evening.start) - $($state.rhythmMap.evening.end)): Energy = $($state.rhythmMap.evening.energy)

**Detected Patterns:**
- Deep work window: $($state.patterns.deepWorkWindow -join ' to ')
- Notification silence: $($state.patterns.notificationSilence -join ' to ')

— Rhythm Intelligence v1.0
"@

Write-Output $report
