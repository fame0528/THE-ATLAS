# Auto-Obsidian Sync — v2.0 Time-Savers
# Syncs memory/facts/ and TASKS.md to Obsidian vault automatically

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace",
    [string]$ObsidianVault = "C:\Users\spenc\Documents\Obsidian\Vaults\Atlas"
)

$sourceNotes = Join-Path $Workspace "memory\facts"
$sourceTasks = Join-Path $Workspace "TASKS.md"
$destNotes = Join-Path $ObsidianVault "Daily Notes"
$destTasks = Join-Path $ObsidianVault "Tasks"

# Ensure destinations exist
if (-not (Test-Path $destNotes)) { New-Item -ItemType Directory -Path $destNotes -Force | Out-Null }
if (-not (Test-Path $destTasks)) { New-Item -ItemType Directory -Path $destTasks -Force | Out-Null }

# Sync daily notes (copy new/updated)
Get-ChildItem $sourceNotes -Filter "*.md" | ForEach-Object {
    $dest = Join-Path $destNotes $_.Name
    if (-not (Test-Path $dest) -or (Get-Item $dest).LastWriteTime -lt $_.LastWriteTime) {
        Copy-Item $_.FullName -Destination $dest -Force
        Write-Verbose "Synced note: $($_.Name)"
    }
}

# Sync TASKS.md
if (Test-Path $sourceTasks) {
    Copy-Item $sourceTasks -Destination (Join-Path $destTasks "TASKS.md") -Force
    Write-Verbose "Synced TASKS.md"
}

Write-Host "Obsidian sync complete."
