# Path Sanitization Sweep
# Spencer Proactive Agent — Fix Hardcoded Paths

# This script searches the entire .openclaw directory for any hardcoded
# references to "Desktop/OPENCLAW" or other incorrect paths and replaces them
# with the correct %USERPROFILE%\.openclaw structure.

param(
    [Parameter(Mandatory = $false)]
    [string]$Workspace = "C:\Users\spenc\.openclaw",
    
    [Parameter(Mandatory = $false)]
    [switch]$DryRun
)

$patterns = @(
    "Desktop/OPENCLAW",
    "C:\\Users\\spenc\\Desktop\\OPENCLAW",
    "C:/Users/spenc/Desktop/OPENCLAW",
    "OPENCLAW/Desktop"
)

$replaceWith = "$env:USERPROFILE\.openclaw"

Write-Host "=== Path Sanitization Sweep ==="
Write-Host "Workspace: $Workspace"
Write-Host "Target patterns: $($patterns -join ', ')"
Write-Host "Replace with: $replaceWith"
Write-Host ""

if ($DryRun) {
    Write-Warning "DRY RUN — no changes will be made"
}

# Get all text files (exclude node_modules, .git, binaries)
$files = Get-ChildItem -Path $Workspace -Recurse -File |
Where-Object { $_.FullName -notmatch "\\node_modules\\|\\\.git\\|\.exe$|\.dll$|\.png$|\.jpg$" } |
Select-Object -ExpandProperty FullName

$totalFiles = $files.Count
$processed = 0
$matchesFound = 0
$filesModified = 0

foreach ($file in $files) {
    $processed++
    if ($processed % 100 -eq 0) {
        Write-Progress -Activity "Scanning files" -Status "$processed/$totalFiles" -PercentComplete ($processed / $totalFiles * 100)
    }
    
    $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    
    $foundInFile = $false
    
    foreach ($pattern in $patterns) {
        if ($content -match [regex]::Escape($pattern)) {
            $content = $content -replace [regex]::Escape($pattern), $replaceWith
            $foundInFile = $true
            $matchesFound++
        }
    }
    
    if ($foundInFile) {
        $filesModified++
        Write-Host "FOUND in: $file"
        if (-not $DryRun) {
            Set-Content -Path $file -Value $content -Encoding UTF8
            Write-Host "  → Fixed" -ForegroundColor Green
        }
        else {
            Write-Host "  → Would fix (dry run)" -ForegroundColor Yellow
        }
    }
}

Write-Progress -Activity "Scanning files" -Completed

Write-Host ""
Write-Host "=== Results ==="
Write-Host "Files scanned: $totalFiles"
Write-Host "Files with matches: $filesModified"
Write-Host "Total match occurrences: $matchesFound"

if ($DryRun) {
    Write-Host "`nRun without -DryRun to apply fixes." -ForegroundColor Yellow
}
else {
    Write-Host "`nAll fixes applied. Restart OpenClaw gateway to pick up changes." -ForegroundColor Green
}
