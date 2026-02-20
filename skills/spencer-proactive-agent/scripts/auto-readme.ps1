# Auto-README Updater — v2.0 Proactive Docs
# Updates README.md files when source files change (keeps docs in sync)

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace",
    [string]$Project = "."  # default to workspace root
)

$projPath = Join-Path $Workspace $Project
$readmePath = Join-Path $projPath "README.md"

if (-not (Test-Path $readmePath)) {
    Write-Verbose "No README.md found in $Project"
    exit 0
}

$readme = Get-Content $readmePath -Raw

# Check for sections that need auto-updating
$updatesMade = $false

# 1. Badges: last commit
$lastCommit = git -C $projPath log -1 --format="%h %ci" 2>$null
if ($lastCommit) {
    $badge = "[![Last commit](https://img.shields.io/badge/last%20commit-$($lastCommit.Split(' ')[0])-blue.svg)](https://github.com/fame0528/THE-ATLAS/commits/main)"
    if ($readme -notmatch "Last commit") {
        $readme = $readme + "`n`n$badge"
        $updatesMade = $true
    }
}

# 2. Build status: simple placeholder (would query CI)
# Not implemented yet

if ($updatesMade) {
    $readme | Out-File -FilePath $readmePath -Encoding UTF8
    Write-Host "README updated: $Project"
}
else {
    Write-Verbose "README already up-to-date"
}
