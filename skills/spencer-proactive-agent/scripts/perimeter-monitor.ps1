# Perimeter Monitor — v2.0 Stealth Security
# Watches for file modifications in sensitive directories and reports anomalies

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace",
    [string]$StateFile = "memory/topics/perimeter-state.json"
)

$sensitivePaths = @(
    ".secrets",
    "credentials",
    ".openclaw\skills\spencer-proactive-agent\config\spencer-agent-v2.json",
    "agent-dashboard\.env*"
)

$statePath = Join-Path $Workspace $StateFile
$state = @{
    lastCheck = (Get-Date).ToString("o")
    knownHashes = @{}
}
if (Test-Path $statePath) {
    try {
        $saved = Get-Content $statePath -Raw | ConvertFrom-Json
        $state.knownHashes = $saved.knownHashes
    } catch { }
}

$alerts = @()

foreach ($relPath in $sensitivePaths) {
    $fullPath = Join-Path $Workspace $relPath
    if (-not (Test-Path $fullPath)) { continue }

    if ((Get-Item $fullPath).PSIsContainer) {
        # Directory: check files inside
        $files = Get-ChildItem $fullPath -Recurse -File -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            $rel = $file.FullName.Replace($Workspace, "").Replace("\","/")
            $currentHash = (Get-FileHash $file.FullName -Algorithm SHA256).Hash
            if ($state.knownHashes.ContainsKey($rel)) {
                if ($state.knownHashes[$rel] -ne $currentHash) {
                    $alerts += "Sensitive file modified: $rel"
                }
            } else {
                # New file
                $alerts += "New sensitive file detected: $rel"
                $state.knownHashes[$rel] = $currentHash
            }
        }
    } else {
        # Single file
        $rel = $fullPath.Replace($Workspace, "").Replace("\","/")
        $currentHash = (Get-FileHash $fullPath -Algorithm SHA256).Hash
        if ($state.knownHashes.ContainsKey($rel)) {
            if ($state.knownHashes[$rel] -ne $currentHash) {
                $alerts += "Sensitive file modified: $rel"
            }
        } else {
            $alerts += "New sensitive file detected: $rel"
            $state.knownHashes[$rel] = $currentHash
        }
    }
}

# Save updated state
$state.lastCheck = (Get-Date).ToString("o")
$state | ConvertTo-Json -Depth 3 | Set-Content -Path $statePath -Encoding UTF8

if ($alerts.Count -gt 0) {
    $report = "🚨 **Perimeter Security Alert**`n`n" + ($alerts -join "`n") + "`n`nReview immediately."
    Write-Output $report
    # TODO: Send to Discord via security persona channel
} else {
    Write-Verbose "Perimeter check: all clear"
}
