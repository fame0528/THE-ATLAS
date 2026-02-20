# Simple progress notifier (lightweight alternative to notify_progress.ps1)
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("ares", "athena", "epimetheus", "hephaestus", "hermes", "hyperion", "kronos", "mnemosyne", "prometheus", "atlas")]
    [string]$Agent,

    [Parameter(Mandatory = $true)]
    [string]$Msg
)

# --- FORCE UTF-8 OUTPUT (Post-Param) ---
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$channels = @{
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

$cid = $channels[$Agent.ToLower()]
if (-not $cid) { Write-Error "Unknown agent: $Agent"; exit 1 }

$icon = $emojiMap[$Agent.ToLower()]
$name = $Agent.ToUpper()
# Format: 📨 **HERMES** Message content
$formattedMsg = "$icon **$name** $Msg"

$openclawCmd = "C:\Users\spenc\AppData\Roaming\npm\openclaw.cmd"
# Use $formattedMsg instead of the old format
$sendArgs = @("message", "send", "--channel", "discord", "-t", "channel:$cid", "-m", $formattedMsg)

try {
    & $openclawCmd @sendArgs 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Sent to #${Agent}: $formattedMsg"
    }
    else {
        Write-Warning "Failed (exit $LASTEXITCODE)"
    }
}
catch {
    Write-Warning "Send error: $_"
}
