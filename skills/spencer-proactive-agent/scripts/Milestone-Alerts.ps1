# Milestone-Alerts.ps1 - Invisible Assistant
# Simple event detection

$Workspace = "C:\Users\spenc\.openclaw\workspace"
$SessionFile = Join-Path $Workspace "SESSION-STATE.md"
$LogDir = Join-Path $Workspace "memory\logs"
$AlertLog = Join-Path $LogDir "milestone-alerts.log"

Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ALERT: Milestone check started"

# Ensure log dir
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

# Read recent session content
if (Test-Path $SessionFile) {
    $all = Get-Content $SessionFile -Raw
    $lines = $all -split "`n"
    $recent = ($lines | Select-Object -Last 50) -join "`n"

    # Git push detection
    if ($recent -match "git push|git commit|pushed") {
        Add-Content -Path $AlertLog -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | GitHub Push | Code pushed. Deploy ready?" -Encoding UTF8
        Write-Host "GitHub push detected"
    }

    # Deep work completion (4h)
    if ($recent -match "4h|four hours|4 hours") {
        Add-Content -Path $AlertLog -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | Deep Work | 4+ hours coding complete." -Encoding UTF8
        Write-Host "Deep work milestone detected"
    }

    # Daily note check
    $todayNote = Join-Path $Workspace "memory\$(Get-Date -Format 'yyyy-MM-dd').md"
    if (-not (Test-Path $todayNote)) {
        $today = Get-Date -Format 'yyyy-MM-dd'
        $already = Get-Content $AlertLog 2>$null | Where-Object { $_ -match $today -and $_ -match "Daily Note" }
        if (-not $already) {
            Add-Content -Path $AlertLog -Value "$today | Daily Note | Daily note not created yet." -Encoding UTF8
            Write-Host "Daily note missing reminder"
        }
    }
} else {
    Write-Host "SESSION-STATE.md not found"
}

Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ALERT: Milestone check completed"