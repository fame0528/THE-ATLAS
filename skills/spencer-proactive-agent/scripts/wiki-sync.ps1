# Wiki Sync — v2.0 Proactive Docs
# Syncs documentation to Obsidian wiki vault

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace",
    [string]$WikiVault = "C:\Users\spenc\Documents\Obsidian\Vaults\Wiki"
)

$sourceDocs = Join-Path $Workspace "docs"
$sourceReadme = Join-Path $Workspace "README.md"
$destDocs = Join-Path $WikiVault "Reference"
$destRoot = Join-Path $WikiVault "Home.md"

if (-not (Test-Path $sourceDocs)) {
    Write-Verbose "No docs/ folder found"
    exit 0
}

if (-not (Test-Path $destDocs)) { New-Item -ItemType Directory -Path $destDocs -Force | Out-Null }

# Copy all markdown files from docs/
Get-ChildItem $sourceDocs -Filter "*.md" | ForEach-Object {
    $dest = Join-Path $destDocs $_.Name
    Copy-Item $_.FullName -Destination $dest -Force
    Write-Verbose "Synced doc: $($_.Name)"
}

# Copy root README as Home.md
if (Test-Path $sourceReadme) {
    Copy-Item $sourceReadme -Destination $destRoot -Force
    Write-Verbose "Synced root README -> Home.md"
}

Write-Host "Wiki sync complete."
