# swarm_log.ps1 - Swarm Activity Logger
# V5.3 - Platinum Standard: ASCII-Safe / Robust / Real-Time
# Uses dynamic emoji generation to prevent encoding corruption.

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("init", "assign", "entry", "learn", "change", "audit", "issue", "fix", "result", "detail", "finalize")]
    [string]$Action,

    [Parameter(Mandatory = $false)]
    [string]$Mission,

    [Parameter(Mandatory = $false)]
    [ValidateSet("ares", "athena", "epimetheus", "hephaestus", "hermes", "hyperion", "kronos", "mnemosyne", "prometheus", "atlas")]
    [string]$Agent,

    [Parameter(Mandatory = $false)]
    [string]$Entry,

    [Parameter(Mandatory = $false)]
    [string]$Summary,

    [Parameter(Mandatory = $false)]
    [string]$Detail,

    [Parameter(Mandatory = $false)]
    [switch]$NoDiscord
)

# --- FORCE UTF-8 OUTPUT (Post-Param) ---
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# --- HELPER: ASCII-SAFE EMOJI ---
function E($code) {
    if ($code -is [string]) { $code = [int]$code }
    return [char]::ConvertFromUtf32($code)
}

# --- CONFIGURATION ---
$logsRoot = "C:\Users\spenc\Documents\Obsidian\Vaults\Atlas\Resources\Olympus\Logs"
# Robust OpenClaw Path Resolution (with fallback)
$openclawCmd = "C:\Users\spenc\AppData\Roaming\npm\openclaw.cmd"
if (-not (Test-Path $openclawCmd)) {
    if (Get-Command "openclaw" -ErrorAction SilentlyContinue) { $openclawCmd = "openclaw" }
}

$today = Get-Date -Format "yyyy-MM-dd"
$dayDir = Join-Path $logsRoot $today
$timestamp = Get-Date -Format "HH:mm:ss"
$timeTag = Get-Date -Format "HHmmss"
$stateFile = Join-Path $logsRoot ".active-swarm.txt"
$activityFile = Join-Path $logsRoot ".active-activity.json"

# --- MAPPINGS (ASCII-SAFE) ---
$emojiMap = @{
    "atlas"      = (E 0x1F5FA) # World Map
    "ares"       = (E 0x1F6E1) # Shield
    "athena"     = (E 0x1F989) # Owl
    "epimetheus" = (E 0x1F4DC) # Scroll
    "hephaestus" = (E 0x1F528) # Hammer
    "hermes"     = (E 0x1F4E8) # Incoming Envelope
    "hyperion"   = (E 0x1F52D) # Telescope
    "kronos"     = (E 0x23F3)  # Hourglass
    "mnemosyne"  = (E 0x1F9E0) # Brain
    "prometheus" = (E 0x1F525) # Fire
}

$prefixMap = @{
    "atlas"      = (E 0x1F5FA) + " **[ATLAS]**"
    "ares"       = (E 0x1F6E1) + " **[ARES]**"
    "athena"     = (E 0x1F989) + " **[ATHENA]**"
    "epimetheus" = (E 0x1F4DC) + " **[EPIMETHEUS]**"
    "hephaestus" = (E 0x1F528) + " **[HEPHAESTUS]**"
    "hermes"     = (E 0x1F4E8) + " **[HERMES]**"
    "hyperion"   = (E 0x1F52D) + " **[HYPERION]**"
    "kronos"     = (E 0x23F3) + " **[KRONOS]**"
    "mnemosyne"  = (E 0x1F9E0) + " **[MNEMOSYNE]**"
    "prometheus" = (E 0x1F525) + " **[PROMETHEUS]**"
}

$channelMap = @{
    "atlas"      = "channel:1471955220194918645"
    "ares"       = "channel:1472997717637857332"
    "athena"     = "channel:1472997751603068991"
    "epimetheus" = "channel:1472997781990932624"
    "hephaestus" = "channel:1472997817428480192"
    "hermes"     = "channel:1472997853105491968"
    "hyperion"   = "channel:1472997889927282873"
    "kronos"     = "channel:1472997916078641364"
    "mnemosyne"  = "channel:1472997945208213515"
    "prometheus" = "channel:1472997978359861350"
}

$actionMap = @{
    "assign" = (E 0x1F4CB) + " **[ASSIGN]**"
    "entry"  = (E 0x1F4CC) + " **[INFO]**"
    "learn"  = (E 0x1F4A1) + " **[LEARN]**"
    "change" = (E 0x1F527) + " **[CHANGE]**"
    "audit"  = (E 0x1F50E) + " **[AUDIT]**"
    "issue"  = (E 0x1F534) + " **[ISSUE]**"
    "fix"    = (E 0x1F691) + " **[FIX]**"
    "result" = (E 0x2705) + " **[RESULT]**"
    "detail" = (E 0x1F4CE) + " **[DETAIL]**"
}

# --- HELPERS ---

function Get-ActiveLogPath {
    if (Test-Path $stateFile) {
        return (Get-Content $stateFile -Raw).Trim()
    }
    return $null
}

function Lock-File {
    param($Path, $Content, $Append = $true)
    $maxRetries = 5
    $delay = 100
    
    for ($i = 0; $i -lt $maxRetries; $i++) {
        try {
            if ($Append) {
                Add-Content -Path $Path -Value $Content -Encoding UTF8 -ErrorAction Stop
            }
            else {
                Set-Content -Path $Path -Value $Content -Encoding UTF8 -ErrorAction Stop
            }
            return $true
        }
        catch {
            Start-Sleep -Milliseconds $delay
            $delay *= 2
        }
    }
    Write-Warning "Failed to write to $Path after retries."
    return $false
}

function Get-ImpactReport {
    param($LogPath)
    # Read log, parse lines, aggregate issues/fixes/results
    if (-not (Test-Path $LogPath)) { return "" }
    
    $content = Get-Content $LogPath -Raw
    
    # Use Dynamic Icons for Matching to match what we write
    $issueIcon = (E 0x1F534)
    $fixIcon = (E 0x1F691)
    $resultIcon = (E 0x2705)
    
    # Regex needing escape for special chars in icons? usually they are single chars.
    $issues = ([regex]::Matches($content, "$issueIcon Issue.*?\| (.*)")).Count
    $fixes = ([regex]::Matches($content, "$fixIcon Fix.*?\| (.*)")).Count
    $results = ([regex]::Matches($content, "$resultIcon Result.*?\| (.*)")).Count

    return @"
### 📊 Impact Summary
- **Issues Found:** $issues
- **Fixes Applied:** $fixes
- **Verified Results:** $results
"@
}

# --- MAIN LOGIC ---

# 1. INIT
if ($Action -eq "init") {
    if (-not $Mission) { Write-Error "Mission required for init."; exit 1 }

    if (-not (Test-Path $logsRoot)) { New-Item -ItemType Directory -Path $logsRoot -Force | Out-Null }
    if (-not (Test-Path $dayDir)) { New-Item -ItemType Directory -Path $dayDir -Force | Out-Null }

    # Sanitized filename
    $safeMission = $Mission -replace "[^a-zA-Z0-9\s]", "" -replace "\s+", "-"
    $logFile = Join-Path $dayDir "SWARM-${safeMission}-${timeTag}.md"
    
    $header = @"
# 🦞 SWARM LOG: $Mission
**Date:** $today
**Start Time:** $timestamp
**Status:** 🟢 Active
**Protocol:** Platinum Standard (Single Thread / Zero Tolerance)

---

## 🏛️ Mission Dashboard

| Agent | Status | Current Task | Last Update |
|---|---|---|---|
"@
    Lock-File -Path $logFile -Content $header -Append $false
    Lock-File -Path $stateFile -Content $logFile -Append $false

    Write-Host "✅ Swarm Initialized: $logFile"
    
    # Init Activity Log
    $activity = @{}
    foreach ($a in $emojiMap.Keys) {
        $activity[$a] = @{ Status = "⚪ Idle"; Task = "-"; LastUpdate = "-" }
    }
    $activity | ConvertTo-Json | Set-Content $activityFile -Encoding UTF8
}

# 2. FINALIZE
elseif ($Action -eq "finalize") {
    $logFile = Get-ActiveLogPath
    if (-not $logFile) { Write-Error "No active swarm log."; exit 1 }

    $impact = Get-ImpactReport -LogPath $logFile

    $footer = @"

---
## 🏁 Mission Debrief
**End Time:** $timestamp
**Summary:** $Summary

$impact

**Mission Status:** ✅ COMPLETE
"@
    Lock-File -Path $logFile -Content $footer
    
    if (Test-Path $stateFile) { Remove-Item $stateFile }
    if (Test-Path $activityFile) { Remove-Item $activityFile }
    
    Write-Host "✅ Swarm Finalized."
    
    # Notify Atlas Channel
    if (-not $NoDiscord) {
        $icon = (E 0x1F3C1) # Chequered Flag
        $msg = "$icon **SWARM DEBRIEF:** $Summary `n$impact"
        $chan = $channelMap["atlas"]
        if ($openclawCmd) {
            Start-Process -FilePath $openclawCmd -ArgumentList "message", "send", "--channel", "discord", "-t", $chan, "-m", "`"$msg`"" -NoNewWindow -Wait
        }
    }
}

# 3. LOGGING ACTIONS
else {
    if (-not $Agent) { Write-Error "Agent required."; exit 1 }
    $logFile = Get-ActiveLogPath
    if (-not $logFile) { Write-Warning "No active log. Writing to console only."; }

    $icon = $emojiMap[$Agent.ToLower()]
    # $role removed (unused)
    $actIcon = $actionMap[$Action.ToLower()]

    # Format Entry
    $mdLine = "| $timestamp | **$icon $Agent** | $actIcon | $Entry |"

    # Update Dashboard (if log exists)
    if ($logFile -and (Test-Path $logFile)) {
        # Check if "Activity Log" section exists (ASCII Match)
        if (-not (Select-String -Path $logFile -Pattern "Activity Log" -Quiet)) {
            $scroll = (E 0x1F4DC)
            Lock-File -Path $logFile -Content "`n## $scroll Activity Log`n`n| Time | Agent | Action | Details |`n|---|---|---|---|"
        }
        
        Lock-File -Path $logFile -Content $mdLine
    }

    # Update JSON State
    if (Test-Path $activityFile) {
        $json = Get-Content $activityFile -Raw | ConvertFrom-Json
        if ($Action -eq "assign") {
            $json.$Agent.Status = "🟢 Active"
            $json.$Agent.Task = $Entry
        }
        elseif ($Action -eq "result") {
            $json.$Agent.Status = "✅ Done"
        }
        $json.$Agent.LastUpdate = $timestamp
        $json | ConvertTo-Json | Set-Content $activityFile -Encoding UTF8
    }

    # --- REAL-TIME DISCORD ---
    # --- REAL-TIME DISCORD (AAA QUALITY EMBEDS) ---
    if (-not $NoDiscord) {
        # Load Webhook from .env if possible, else fallback
        $envFile = Join-Path $PSScriptRoot "..\..\..\.env"
        $webhook = ""
        if (Test-Path $envFile) {
            $envContent = Get-Content $envFile
            # Try Agent Webhook First
            $start = "DISCORD_WEBHOOK_" + $Agent.ToUpper() + "="
            $webhook = ($envContent | Where-Object { $_ -like "$start*" } | Select-Object -First 1) -replace "$start", ""
            
            # Fallback to System
            if (-not $webhook) {
                $webhook = ($envContent | Where-Object { $_ -like "DISCORD_WEBHOOK_SYSTEM=*" } | Select-Object -First 1) -replace "DISCORD_WEBHOOK_SYSTEM=", ""
            }
        }

        # Color Mapping
        # Info=Blue(0x3498db), Success=Green(0x2ecc71), Warn=Yellow(0xf1c40f), Error=Red(0xe74c3c), Debug=Grey(0x95a5a6)
        $color = "0x3498db"
        $actLower = $Action.ToLower()
        if ($actLower -match "result|fix|finalize") { $color = "0x2ecc71" }
        elseif ($actLower -match "issue|audit") { $color = "0xe74c3c" }
        elseif ($actLower -match "change|detail") { $color = "0xf1c40f" }
        elseif ($actLower -match "assign") { $color = "0x9b59b6" } # Purple

        $embedScript = Join-Path $PSScriptRoot "..\..\utilities\send-embed.js"
        
        if (Test-Path $embedScript) {
            # Construct Args
            $title = "$icon $Agent - $actIcon" 
            
            $nodeArgs = @($embedScript)
            if ($webhook) { $nodeArgs += "--webhook"; $nodeArgs += "$webhook" }
            
            $nodeArgs += "--title"; $nodeArgs += "$title"
            
            $descContent = $Entry
            if ($Detail) { $descContent += "`n`n$Detail" }
            $nodeArgs += "--desc"; $nodeArgs += "$descContent"
            
            $nodeArgs += "--color"; $nodeArgs += "$color"
            $nodeArgs += "--agent"; $nodeArgs += "$($Agent.ToLower())"
            $nodeArgs += "--footer"; $nodeArgs += "Swarm Protocol • $timestamp"

            # ADD AAA FIELDS
            $fields = @()
            if ($Mission) { $fields += @{ name = "Mission"; value = "$Mission"; inline = $false } }
            $fields += @{ name = "Action Type"; value = "$actIcon"; inline = $true }
            
            $fieldsJson = $fields | ConvertTo-Json -Compress
            $fieldsBytes = [System.Text.Encoding]::UTF8.GetBytes($fieldsJson)
            $fieldsBase64 = [Convert]::ToBase64String($fieldsBytes)
            $nodeArgs += "--fields"; $nodeArgs += "$fieldsBase64"

            # CHANNEL ROUTING (Use Bot Token)
            $chanId = $channelMap[$Agent.ToLower()] -replace "channel:", ""
            if ($chanId) { $nodeArgs += "--channel"; $nodeArgs += $chanId }
            
            & "node" $nodeArgs
        }
        else {
            # Fallback to OpenClaw CLI if utility missing
            $channelId = $channelMap[$Agent.ToLower()]
            if (-not $channelId) { $channelId = $channelMap["atlas"] }
            $safeMsg = "$icon **$($Agent.ToUpper())** $actIcon $Entry"
            $safeMsg = $safeMsg.Replace('"', '\"')
            if ($openclawCmd) {
                try {
                    Start-Process -FilePath $openclawCmd -ArgumentList "message", "send", "--channel", "discord", "-t", $channelId, "-m", "`"$safeMsg`"" -NoNewWindow -Wait
                }
                catch { Write-Warning "Discord Send Failed: $_" }
            }
        }
    }
    
    $prefix = $prefixMap[$Agent.ToLower()]
    Write-Host "$prefix $actIcon : $Entry"
    if ($Detail) { Write-Host "   > $Detail" }
}

