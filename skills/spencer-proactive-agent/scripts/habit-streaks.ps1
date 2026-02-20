# Habit Streaks — v2.0 Memory Companion
# Tracks habit completion from daily notes and provides streak counts

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace",
    [string]$HabitName  # e.g., "exercise", "writing", "learning"
)

$memoryDir = Join-Path $Workspace "memory\facts"
$stateFile = Join-Path $Workspace "memory\topics\habit-streaks.json"

# Load state
$state = @{
    updatedAt = (Get-Date).ToString("o")
    habits = @{}
}
if (Test-Path $stateFile) {
    try {
        $saved = Get-Content $stateFile -Raw | ConvertFrom-Json
        $state = $saved
    } catch { }
}

# Get last 30 days of notes
$notes = Get-ChildItem $memoryDir -Filter "*.md" | Sort-Object Name -Descending | Select-Object -First 30

$habitFound = $false
foreach ($note in $notes) {
    $date = $note.BaseName
    $content = Get-Content $note.FullName -Raw
    # Look for habit markers like "[x] exercise" or "- [X] exercise"
    if ($content -match "(?i)^\s*[-*]\s+\[[xX]\]\s+$HabitName") {
        $habitFound = $true
    } else {
        if ($habitFound) {
            # Streak broken
            break
        }
    }
}

if (-not $habitFound) {
    $currentStreak = 0
} else {
    $currentStreak = 0
    foreach ($note in $notes) {
        $date = $note.BaseName
        $content = Get-Content $note.FullName -Raw
        if ($content -match "(?i)^\s*[-*]\s+\[[xX]\]\s+$HabitName") {
            $currentStreak++
        } else {
            break
        }
    }
}

# Update state
$state.habits[$HabitName] = @{
    currentStreak = $currentStreak
    lastUpdated = (Get-Date).ToString('yyyy-MM-dd')
}
$state | ConvertTo-Json -Depth 3 | Set-Content -Path $stateFile -Encoding UTF8

$report = "🔥 **Habit Streak — $HabitName**`n`nCurrent streak: **$currentStreak** day(s)`n`nKeep it going! — Memory Companion v1.0"
Write-Output $report
