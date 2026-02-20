# Skill Auto-Registration — v2.0 Time-Savers
# Registers skills in openclaw when new skill folders appear

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace",
    [string]$SkillsDir = "skills"
)

$skillsRoot = Join-Path $Workspace $SkillsDir
$registryFile = Join-Path $Workspace ".openclaw\skills-registry.json"

# Load existing registry
$registry = @{}
if (Test-Path $registryFile) {
    try { $registry = Get-Content $registryFile -Raw | ConvertFrom-Json } catch { }
}

# Scan skill directories
$skillDirs = Get-ChildItem $skillsRoot -Directory | Where-Object { Test-Path (Join-Path $_.FullName "SKILL.md") }

foreach ($skill in $skillDirs) {
    $skillId = $skill.Name
    $skillFile = Join-Path $skill.FullName "SKILL.md"
    $meta = @{
        path = $skill.FullName
        registeredAt = (Get-Date).ToString("o")
    }

    # Parse SKILL.md for name/description if needed
    $content = Get-Content $skillFile -Raw
    if ($content -match "^#\s+(.+)$") { $meta.name = $matches[1] }
    if ($content -match "(?s)Description:\s*\n(.+?)\n\n") { $meta.description = $matches[1].Trim() }

    $registry[$skillId] = $meta
}

# Save registry
$registry | ConvertTo-Json -Depth 3 | Set-Content -Path $registryFile -Encoding UTF8

Write-Host "Skill registry updated: $($registry.Count) skills"
