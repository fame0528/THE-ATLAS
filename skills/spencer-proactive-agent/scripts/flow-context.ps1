# Flow-Context.ps1 - v2.0 Flow-Aware Scheduling Core
# Provides flow state detection and notification routing for Spencer-centered scheduling

param()

$script:FlowContext = @{
    IsQuietHours = $false
    IsDeepWork = $false
    IsNaturalBreak = $false
    CurrentState = "normal"
    LastActivity = $null
    BufferStats = $null
}

function Initialize-FlowContext {
    param([string]$Workspace = "C:\Users\spenc\.openclaw\workspace")
    
    $configPath = Join-Path $Workspace "skills\spencer-proactive-agent\config\spencer-agent-v2.json"
    if (Test-Path $configPath) {
        $script:Config = Get-Content $configPath -Raw | ConvertFrom-Json
    }
    
    # Load flow state from memory if exists
    $stateFile = Join-Path $Workspace "memory\topics\flow-state.json"
    if (Test-Path $stateFile) {
        try {
            $saved = Get-Content $stateFile -Raw | ConvertFrom-Json
            $script:FlowContext.LastActivity = $saved.lastActivity
        }
        catch { }
    }
    
    Write-Verbose "Flow context initialized"
}

function Get-FlowState {
    # Returns current flow state hashtable
    return $script:FlowContext
}

function Test-QuietHours {
    # Check if current time is within quiet hours (10 PM - 7 AM)
    $now = Get-Date
    $hour = $now.Hour
    
    $quietStart = 22
    $quietEnd = 7
    
    # Adjust for midnight crossing
    if ($hour -ge $quietStart -or $hour -lt $quietEnd) {
        $script:FlowContext.IsQuietHours = $true
        $script:FlowContext.CurrentState = "quiet"
        return $true
    }
    
    $script:FlowContext.IsQuietHours = $false
    return $false
}

function Test-DeepWork {
    # Heuristics to detect deep work mode
    $deepWorkConfig = $script:Config.features.'flow-aware-scheduling'.deepWork
    if (-not $deepWorkConfig.enabled) { return $false }
    
    $detection = $deepWorkConfig.detection
    $score = 0
    
    # 1. Typing threshold: check if recent WAL entries show continuous activity
    $walFile = Join-Path $script:Workspace "SESSION-STATE.md"
    if (Test-Path $walFile) {
        $lines = Get-Content $walFile -Tail 100
        $recentLines = $lines | Where-Object { $_.Contains("Current task:") }
        if ($recentLines.Count -ge 5) {
            $score += 30
        }
    }
    
    # 2. Git push within last 30 minutes
    $projects = @("C:\Users\spenc\.openclaw\workspace\scripts", "C:\Users\spenc\.openclaw\workspace\income_bot")
    foreach ($proj in $projects) {
        if (Test-Path $proj) {
            $gitLog = git -C $proj log --since="30 minutes ago" --oneline 2>$null
            if ($gitLog) {
                $score += 30
                break
            }
        }
    }
    
    # 3. Discord DND check (simplified — assume not DND unless marker)
    if ($deepWorkConfig.detection.discordDNDCheck) {
        # Could check Discord status via API, but for now use WAL tag
        $hasDND = $lines | Where-Object { $_.Contains("[DND]") }
        if ($hasDND) { $score += 20 }
    }
    
    # 4. Buffer spike check
    if ($script:FlowContext.BufferStats) {
        $growthRate = $script:FlowContext.BufferStats.growthKBPerMin
        if ($growthRate -ge $detection.bufferSpikeKBPerMin) {
            $score += 20
        }
    }
    
    $threshold = 50  # Need >50% to consider deep work
    $isDeep = $score -ge $threshold
    $script:FlowContext.IsDeepWork = $isDeep
    if ($isDeep) { $script:FlowContext.CurrentState = "deep_work" }
    return $isDeep
}

function Test-NaturalBreak {
    # Detect if Spencer is at a natural break (inactivity, after push, etc.)
    $now = Get-Date
    
    # Check last activity from memory/logs
    if ($script:FlowContext.LastActivity) {
        $last = $script:FlowContext.LastActivity
        $idleMin = ($now - $last).TotalMinutes
        
        if ($idleMin -ge 5) {
            $script:FlowContext.IsNaturalBreak = $true
            return $true
        }
    }
    
    # Check for recent git push (within 5 min)
    $projects = @("C:\Users\spenc\.openclaw\workspace\scripts", "C:\Users\spenc\.openclaw\workspace\income_bot")
    foreach ($proj in $projects) {
        if (Test-Path $proj) {
            $gitLog = git -C $proj log --since="5 minutes ago" --oneline 2>$null
            if ($gitLog) {
                $script:FlowContext.IsNaturalBreak = $true
                return $true
            }
        }
    }
    
    $script:FlowContext.IsNaturalBreak = $false
    return $false
}

function Should-SendNotification {
    # Determines if a notification should be sent now based on flow state
    $flow = Get-FlowState
    
    # Emergency alerts always go through
    param([string]$Priority = "normal")  # normal, high, emergency
    
    if ($Priority -eq "emergency") { return $true }
    
    # Quiet hours: only emergencies
    if ($flow.IsQuietHours) { return $false }
    
    # Deep work: only high priority
    if ($flow.IsDeepWork -and $Priority -eq "normal") { return $false }
    
    # Natural break: good time to send
    if ($flow.IsNaturalBreak -and $Priority -eq "normal") { return $true }
    
    # Otherwise, check batching schedule
    $batchSchedule = $script:Config.features.'flow-aware-scheduling'.notificationClustering
    if ($batchSchedule.enabled) {
        $now = Get-Date
        $minute = $now.Minute
        $hour = $now.Hour
        
        # Check if we're at a batch time (9:00, 14:00, 21:00)
        $batchTimes = @(9, 14, 21)
        if ($batchTimes -contains $hour -and $minute -lt 5) {
            return $true
        }
        return $false  # Defer to batch
    }
    
    return $true
}

function Get-TargetChannel {
    # Determines which persona channel should receive this notification
    param(
        [string]$Category = "general"  # general, metrics, docs, security, etc.
    )
    
    $channelMap = @{
        "metrics" = "hyperion"
        "docs" = "epimetheus"
        "security" = "ares"
        "health" = "athena"
        "general" = "atlas"
        "flow" = "kronos"
    }
    
    if ($channelMap.ContainsKey($category)) {
        return $channelMap[$category]
    }
    
    return "atlas"  # Default
}

function Update-FlowState {
    # Called periodically to update flow context
    Initialize-FlowContext
    
    Test-QuietHours | Out-Null
    Test-DeepWork | Out-Null
    Test-NaturalBreak | Out-Null
    
    # Save state for other processes
    $stateDir = Join-Path $script:Workspace "memory\topics"
    if (-not (Test-Path $stateDir)) { New-Item -ItemType Directory -Path $stateDir -Force | Out-Null }
    $stateFile = Join-Path $stateDir "flow-state.json"
    
    $state = @{
        timestamp = (Get-Date).ToString("o")
        isQuietHours = $script:FlowContext.IsQuietHours
        isDeepWork = $script:FlowContext.IsDeepWork
        isNaturalBreak = $script:FlowContext.IsNaturalBreak
        currentState = $script:FlowContext.CurrentState
        lastActivity = $script:FlowContext.LastActivity
    } | ConvertTo-Json
    
    Set-Content -Path $stateFile -Value $state -Encoding UTF8
}

# Initialize on module load
$script:Workspace = "C:\Users\spenc\.openclaw\workspace"
Initialize-FlowContext
