# Working Buffer Monitor v2.0 - Invisible Assistant
param(
    [string]$Mode = "monitor",
    [int]$SilentThreshold = 60,
    [int]$NotifyThreshold = 85,
    [int]$CriticalThreshold = 95,
    [switch]$AutoCompact,
    [switch]$Quiet,
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace"
)

$buffer = Join-Path $Workspace "memory\working-buffer.md"
$SessionFile = Join-Path $Workspace "SESSION-STATE.md"

function Write-Log($msg) {
    if (-not $Quiet) {
        $ts = Get-Date -Format "MM-dd-yyyy HH:mm:ss"
        Write-Host "[$ts] WB: $msg"
    }
}

function Invoke-Compression {
    param([string]$Workspace)
    $compressionScript = Join-Path $Workspace "skills\spencer-proactive-agent\scripts\Compress-Buffer.ps1"
    if (Test-Path $compressionScript) {
        Write-Log "Invoking buffer compression..."
        & powershell -File $compressionScript -Workspace $Workspace
        return $LASTEXITCODE
    }
    else {
        Write-Log "WARN: Compress-Buffer.ps1 not found"
        return 1
    }
}

function Check-Milestones {
    param([string]$Workspace)
    
    # Load v2 config if exists
    $configPath = Join-Path $Workspace "skills\spencer-proactive-agent\config\spencer-agent-v2.json"
    if (-not (Test-Path $configPath)) { return }
    
    try {
        $config = Get-Content $configPath -Raw | ConvertFrom-Json
        $milestones = $config.features.'invisible-assistant'.milestoneAlerts
        if (-not $milestones.enabled) { return }
    }
    catch { return }
    
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $walDir = Join-Path $Workspace "memory/logs"
    $milestoneLog = Join-Path $walDir "milestone-alerts.log"
    
    # 1. Git push detection (check recent git commits in scripts/ and income_bot/)
    if ($milestones.triggers.gitPush) {
        $projects = @("scripts", "income_bot")
        foreach ($proj in $projects) {
            $projPath = Join-Path $Workspace $proj
            if (Test-Path $projPath) {
                $gitLog = git -C $projPath log --since="5 minutes ago" --oneline 2>$null
                if ($gitLog) {
                    $msg = "🚀 Git push detected in $proj — Deploy ready?"
                    Write-Log $msg
                    Add-Content -Path $milestoneLog -Value "$ts | MILESTONE | $msg"
                    # TODO: Send Discord embed via notify_progress.ps1 when integration ready
                }
            }
        }
    }
    
    # 2. Build success/failure (check logs/)
    if ($milestones.triggers.buildSuccess -or $milestones.triggers.buildFailure) {
        $buildLog = Join-Path $Workspace "logs\build.log"
        if (Test-Path $buildLog) {
            $recent = Get-Content $buildLog -Tail 10
            if ($recent -match "error|failed") {
                $msg = "❌ Build may have failed — check logs"
                Write-Log $msg
                Add-Content -Path $milestoneLog -Value "$ts | MILESTONE | $msg"
            }
            elseif ($recent -match "success|complete") {
                $msg = "✅ Build succeeded"
                Write-Log $msg
                Add-Content -Path $milestoneLog -Value "$ts | MILESTONE | $msg"
            }
        }
    }
    
    # 3. Deep work completion (4h) — check for sustained typing/activity
    if ($milestones.triggers.deepWork.enabled) {
        $thresholdMin = $milestones.triggers.deepWork.thresholdMinutes
        # Simple heuristic: check if last rotation was > threshold ago and buffer still active
        $bufferStats = Get-Item $buffer -ErrorAction SilentlyContinue
        if ($bufferStats) {
            $lastWrite = $bufferStats.LastWriteTime
            $elapsed = (Get-Date) - $lastWrite
            if ($elapsed.TotalMinutes -ge $thresholdMin) {
                # Check if there's been continuous activity (buffer growing)
                $sessionStats = Get-Item $SessionFile -ErrorAction SilentlyContinue
                if ($sessionStats -and $sessionStats.Length -gt 100000) {
                    $msg = "🍅 Deep work milestone ($thresholdMin min) — take a break?"
                    Write-Log $msg
                    Add-Content -Path $milestoneLog -Value "$ts | MILESTONE | $msg"
                }
            }
        }
    }
    
    # 4. Self-care missed (check memory/self-care/*.json)
    if ($milestones.triggers.selfCareMissed) {
        $today = Get-Date -Format "yyyy-MM-dd"
        $selfCareFile = Join-Path $Workspace "memory\self-care\$today.json"
        if (-not (Test-Path $selfCareFile)) {
            $msg = "💊 Self-care check pending — morning routine?"
            Write-Log $msg
            Add-Content -Path $milestoneLog -Value "$ts | MILESTONE | $msg"
        }
    }
}

if ($Mode -eq "monitor") {
    $json = openclaw sessions list --limit 20 --json 2>$null
    if (-not $json) { Write-Log "ERROR: openclaw not responding"; exit 1 }
    try {
        $s = $json | ConvertFrom-Json -ErrorAction Stop
        if (-not $s.sessions -or $s.sessions.Count -eq 0) { Write-Log "No sessions"; exit 0 }
        $a = $s.sessions | Where-Object { $_.kind -eq "group" -and $_.key -like "*discord*" } | Select-Object -First 1
        if (-not $a) { Write-Log "No discord session"; exit 0 }
        $used = $a.totalTokens; $max = $a.contextTokens
        if (-not $max -or $max -eq 0) { Write-Log "Invalid max tokens"; exit 1 }
        $pct = [math]::Round(($used / $max) * 100, 1)
        if (-not $Quiet) {
            Write-Host "Current context: $pct% (Notify: $NotifyThreshold%) | Used: $used / $max"
        }
        
        # v2.0: Check SESSION-STATE.md size and compress if needed
        if (Test-Path $SessionFile) {
            $sessionSize = (Get-Item $SessionFile).Length
            $configPath = Join-Path $Workspace "skills\spencer-proactive-agent\config\spencer-agent-v2.json"
            if (Test-Path $configPath) {
                try {
                    $config = Get-Content $configPath -Raw | ConvertFrom-Json
                    $threshold = $config.features.'invisible-assistant'.bufferCompression.thresholdBytes
                    if ($sessionSize -ge $threshold) {
                        Write-Log "SESSION-STATE.md size $sessionSize >= $threshold - compressing"
                        Invoke-Compression -Workspace $Workspace
                    }
                }
                catch { }
            }
        }
        
        # v2.0: Check milestones (silent, just log)
        Check-Milestones -Workspace $Workspace
        
        if ($AutoCompact) {
            if ($pct -ge $CriticalThreshold) {
                $ts = Get-Date -Format "MM-dd-yyyy HH:mm:ss"
                $archive = Join-Path $Workspace "memory\buffer-archive"
                if (-not (Test-Path $archive)) { New-Item -ItemType Directory -Path $archive -Force | Out-Null }
                $stamp = Get-Date -Format "MM-dd-yyyy-HHmmss"
                $dest = Join-Path $archive "working-buffer-$stamp.md"
                if (Test-Path $buffer) {
                    Move-Item -Path $buffer -Destination $dest -Force
                    "# Working Buffer`nRotated: $stamp`n---`n" | Out-File -FilePath $buffer -Encoding UTF8
                    $walPath = Join-Path $Workspace "memory/logs/buffer-auto-rotate.log"
                    $walEntry = @"
## $ts EST CRITICAL

- Working buffer auto-rotation triggered at CRITICAL level
- Current: $pct% (threshold: $CriticalThreshold%)
- Archived to: $dest
- Status: Auto-rotated but buffer remains critically high
- Action: Manual intervention required
"@
                    Add-Content -Path $walPath -Value $walEntry
                }
                Write-Host "CRITICAL: Working buffer at $pct% - manual intervention required."
                exit 0
            }
            elseif ($pct -ge $NotifyThreshold) {
                $ts = Get-Date -Format "MM-dd-yyyy HH:mm:ss"
                $archive = Join-Path $Workspace "memory\buffer-archive"
                if (-not (Test-Path $archive)) { New-Item -ItemType Directory -Path $archive -Force | Out-Null }
                $stamp = Get-Date -Format "MM-dd-yyyy-HHmmss"
                $dest = Join-Path $archive "working-buffer-$stamp.md"
                if (Test-Path $buffer) {
                    Move-Item -Path $buffer -Destination $dest -Force
                    "# Working Buffer`nRotated: $stamp`n---`n" | Out-File -FilePath $buffer -Encoding UTF8
                    $walPath = Join-Path $Workspace "memory/logs/buffer-auto-rotate.log"
                    $walEntry = @"
## $ts EST WARNING

- Working buffer auto-rotation triggered at WARNING level
- Current: $pct% (threshold: $NotifyThreshold%)
- Archived to: $dest
- Status: Auto-rotated but buffer still elevated
"@
                    Add-Content -Path $walPath -Value $walEntry
                }
                exit 0
            }
            elseif ($pct -ge $SilentThreshold) {
                $ts = Get-Date -Format "MM-dd-yyyy HH:mm:ss"
                $archive = Join-Path $Workspace "memory\buffer-archive"
                if (-not (Test-Path $archive)) { New-Item -ItemType Directory -Path $archive -Force | Out-Null }
                $stamp = Get-Date -Format "MM-dd-yyyy-HHmmss"
                $dest = Join-Path $archive "working-buffer-$stamp.md"
                if (Test-Path $buffer) {
                    Move-Item -Path $buffer -Destination $dest -Force
                    "# Working Buffer`nRotated: $stamp`n---`n" | Out-File -FilePath $buffer -Encoding UTF8
                    $walPath = Join-Path $Workspace "memory/logs/buffer-auto-rotate.log"
                    $walEntry = @"
## $ts EST

- Working buffer auto-rotation triggered
- Threshold: $pct% >= $SilentThreshold%
- Archived to: $dest
- Status: Success
"@
                    Add-Content -Path $walPath -Value $walEntry
                }
                exit 0
            }
            exit 0
        }
        if ($pct -ge $NotifyThreshold) {
            Write-Log "WARN: $pct% >= $NotifyThreshold%"
            $ts = Get-Date -Format "MM-dd-yyyy HH:mm:ss"
            $entry = "## $ts`nContext: $pct% ($used/$max)`n"
            if (Test-Path $buffer) {
                Add-Content -Path $buffer -Value $entry -Encoding UTF8
            }
            else {
                "# Working Buffer Log`n---`n" + $entry | Out-File -FilePath $buffer -Encoding UTF8
            }
            $msg = "Working buffer at $pct% ($used/$max tokens). Consider running manual rotation."
            Write-Host $msg
        }
    }
    catch {
        Write-Log "ERROR: $($_.Exception.Message)"
        exit 1
    }
}
elseif ($Mode -eq "rotate") {
    if (-not (Test-Path $buffer)) { Write-Host "No buffer to rotate"; exit 0 }
    $archive = Join-Path $Workspace "memory\buffer-archive"
    if (-not (Test-Path $archive)) { New-Item -ItemType Directory -Path $archive -Force | Out-Null }
    $stamp = Get-Date -Format "MM-dd-yyyy-HHmmss"
    $dest = Join-Path $archive "working-buffer-$stamp.md"
    Move-Item -Path $buffer -Destination $dest -Force
    Write-Host "Buffer rotated to: $dest"
    "# Working Buffer`nRotated: $stamp`n---`n" | Out-File -FilePath $buffer -Encoding UTF8
}
elseif ($Mode -eq "recover") {
    if (Test-Path $buffer) {
        $size = (Get-Item $buffer).Length
        Write-Host "Buffer OK: $buffer ($size bytes)"
    }
    else {
        Write-Host "Buffer missing"
    }
}
elseif ($Mode -eq "test") {
    $json = openclaw sessions list --limit 1 --json 2>$null
    if (-not $json) { Write-Host "TEST FAIL: openclaw not responding"; exit 1 }
    try {
        $p = $json | ConvertFrom-Json -ErrorAction Stop
        if ($p.sessions.Count -eq 0) { Write-Host "TEST OK: no sessions (idle)" } else { Write-Host "TEST OK: json parsed ($($p.sessions.Count) sessions)" }
    }
    catch {
        Write-Host "TEST FAIL: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
    $test = "## TEST " + (Get-Date -Format "MM-dd-yyyy HH:mm:ss") + "`nOK`n"
    if (Test-Path $buffer) { Add-Content -Path $buffer -Value $test } else { "# Test`n---`n" + $test | Out-File $buffer -Encoding UTF8 }
    Write-Host "All tests passed" -ForegroundColor Green
}
else {
    Write-Error "Invalid mode. Use: monitor, rotate, recover, test"
}
