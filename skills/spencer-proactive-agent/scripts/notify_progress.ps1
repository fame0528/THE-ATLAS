# notify_progress - Real-time Swarm Status Updates
# Atlas calls this from the SINGLE main thread to post to persona channels.
# Usage: .\notify_progress.ps1 -Agent "athena" -Message "Design complete" -Level success

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("ares", "athena", "epimetheus", "hephaestus", "hermes", "hyperion", "kronos", "mnemosyne", "prometheus", "atlas")]
    [string]$Agent,

    [Parameter(Mandatory = $true)]
    [string]$Message,
    
    [Parameter(Mandatory = $false)]
    [string]$Detail,
    
    [Parameter(Mandatory = $false)]
    [ValidateSet("info", "warning", "success", "error", "debug")]
    [string]$Level = "info"
)

# --- FORCE UTF-8 OUTPUT (Post-Param) ---
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Hard-coded channel mapping (from OLYMPUS_INDEX.md)
$channelMap = @{
    "atlas"      = "1471955220194918645"
    "ares"       = "1472997717637857332"
    "athena"     = "1472997751603068991"
    "epimetheus" = "1472997781990932624"
    "hephaestus" = "1472997817428480192"
    "hermes"     = "1472997853105491968"
    "hyperion"   = "1472997889927282873"
    "kronos"     = "1472997916078641364"
    "mnemosyne"  = "1472997945208213515"
    "prometheus" = "1472997978359861350"
}

# --- HELPER: ASCII-SAFE EMOJI ---
function E($code) {
    if ($code -is [string]) { $code = [int]$code }
    return [char]::ConvertFromUtf32($code)
}

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

# Level indicator (ASCII-safe emojis, effectively "colors")
$levelPrefix = @{
    "info"    = ""
    "warning" = (E 0x26A0) + " **[WARN]** "
    "success" = (E 0x2705) + " **[OK]** "
    "error"   = (E 0x1F6D1) + " **[ERR]** "
    "debug"   = (E 0x1F41B) + " **[DBG]** "
}

$agentLower = $Agent.ToLower()
$channelId = $channelMap[$agentLower]
$icon = $emojiMap[$agentLower]
$name = $Agent.ToUpper()
$persona = "**$name**" # For log file compatibility
# Use emoji directly for default "ASSIGNED" if possible, but here we just map level
$indicator = $levelPrefix[$Level]

if (-not $channelId) {
    Write-Error "Unknown agent: $Agent"
    exit 1
}

# --- AAA QUALITY EMBEDS ---
$envFile = Join-Path $PSScriptRoot "..\..\..\.env"
$webhook = ""
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    # Try Agent Webhook First
    $start = "DISCORD_WEBHOOK_" + $Agent.ToUpper() + "="
    $webhook = ($envContent | Where-Object { $_ -like "$start*" } | Select-Object -First 1) -replace "$start", ""
    
    # Fallback logica: ONLY use System Webhook if no Channel ID available
    # If we have a channelId, we prefer Bot Token routing for accuracy.
    if (-not $webhook -and -not $channelId) {
        $webhook = ($envContent | Where-Object { $_ -like "DISCORD_WEBHOOK_SYSTEM=*" } | Select-Object -First 1) -replace "DISCORD_WEBHOOK_SYSTEM=", ""
    }
}

# Color Mapping
$color = "0x3498db" # Info Blue
$statusText = "In Progress"
switch ($Level) {
    "success" { $color = "0x2ecc71"; $statusText = "Completed" } # Green
    "warning" { $color = "0xf1c40f"; $statusText = "Review Needed" } # Yellow
    "error" { $color = "0xe74c3c"; $statusText = "Failed/Blocked" } # Red
    "debug" { $color = "0x95a5a6"; $statusText = "Diagnostics" } # Grey
}

$embedScript = Join-Path $PSScriptRoot "..\..\utilities\send-embed.js"

if (Test-Path $embedScript) {
    $title = "$icon $name Progress Update"
    $nodeArgs = @($embedScript)
    if ($webhook) { $nodeArgs += "--webhook"; $nodeArgs += "$webhook" }
    
    $nodeArgs += "--title"; $nodeArgs += "$title"
    
    $descContent = $Message
    if ($Detail) { $descContent += "`n`n$Detail" }
    $nodeArgs += "--desc"; $nodeArgs += "$descContent"
    
    $nodeArgs += "--color"; $nodeArgs += "$color"
    $nodeArgs += "--agent"; $nodeArgs += "$agentLower" # Use lowercase for avatar lookup
    $nodeArgs += "--footer"; $nodeArgs += "Proactive Agent • $Level"
    
    # ADD AAA FIELDS
    $role = if ($Agent -eq "atlas") { "Orchestrator" } else { "Subagent Swarm" }
    $fields = @(
        @{ name = "Status"; value = "$indicator $statusText"; inline = $true }
        @{ name = "Role"; value = "$role"; inline = $true }
    )
    $fieldsJson = $fields | ConvertTo-Json -Compress
    $fieldsBytes = [System.Text.Encoding]::UTF8.GetBytes($fieldsJson)
    $fieldsBase64 = [Convert]::ToBase64String($fieldsBytes)
    $nodeArgs += "--fields"; $nodeArgs += "$fieldsBase64"
    
    # Channel ID for Bot Token routing
    if ($channelId) { $nodeArgs += "--channel"; $nodeArgs += $channelId }

    & "node" $nodeArgs
}
else {
    # Fallback to OpenClaw CLI
    $indicator = $levelPrefix[$Level]
    $fullMessage = "$icon **$name** ${indicator}${Message}"
    $openclawCmd = "C:\Users\spenc\AppData\Roaming\npm\openclaw.cmd"
    if (Test-Path $openclawCmd) {
        try {
            Start-Process -FilePath $openclawCmd -ArgumentList "message", "send", "--channel", "discord", "-t", "channel:$channelId", "-m", "`"$fullMessage`"" -NoNewWindow -Wait
        }
        catch { Write-Warning "Send error: $_" }
    }
}

# Auto-append to active swarm log (if one exists)
$swarmStateFile = "C:\Users\spenc\Documents\Obsidian\Vaults\Atlas\Resources\Olympus\Logs\.active-swarm.txt"
if (Test-Path $swarmStateFile) {
    $logPath = (Get-Content $swarmStateFile -Raw).Trim()
    if ($logPath -and (Test-Path $logPath)) {
        $logTime = Get-Date -Format "HH:mm:ss"
        $typeLabel = switch ($Level) {
            "success" { "Done" }
            "warning" { "Warning" }
            "error" { "Error" }
            default { "Update" }
        }
        $safeMsg = $Message -replace '\|', '-'
        if ($Detail) { $safeMsg += " (" + ($Detail -replace '\|', '-') + ")" }
        $logLine = "| $logTime | $persona | $typeLabel | $safeMsg |"
        Add-Content -Path $logPath -Value $logLine -Encoding UTF8
    }
}

Write-Host "$icon $Agent $levelPrefix[$Level] : $Message"
if ($Detail) { Write-Host "   > $Detail" }
