# daily-digest.ps1 - v2.0 Invisible Assistant
# Collects milestone alerts and buffer status, posts to #atlas as a single embed

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace",
    [string]$DigestType = "morning"  # morning, afternoon, evening
)

$milestoneLog = Join-Path $Workspace "memory\logs\milestone-alerts.log"
$bufferLog = Join-Path $Workspace "memory\logs\buffer-auto-rotate.log"
$compressionLog = Join-Path $Workspace "memory\logs\buffer-compression.log"
$digestDir = Join-Path $Workspace "memory\digests"
$digestFile = Join-Path $digestDir "$(Get-Date -Format 'yyyy-MM-dd')-$DigestType.json"

# Ensure digest directory
if (-not (Test-Path $digestDir)) { New-Item -ItemType Directory -Path $digestDir -Force | Out-Null }

function Get-ReMilestones {
    param([string]$LogPath, [int]$HoursBack = 24)
    if (-not (Test-Path $LogPath)) { return @() }
    $cutoff = (Get-Date).AddHours(-$HoursBack)
    $entries = Get-Content $LogPath | Where-Object { $_ -match '^\d{4}-\d{2}-\d{2}' } | ForEach-Object {
        try {
            $ts = [datetime]::ParseExact($_.Substring(0,19), 'yyyy-MM-dd HH:mm:ss', $null)
            if ($ts -ge $cutoff) { $_ }
        }
        catch { }
    }
    return $entries
}

function Get-BufferSummary {
    # Get latest buffer stats
    $summary = @{}
    if (Test-Path $bufferLog) {
        $last = Get-Content $bufferLog -Tail 20
        $summary.BufferRotations = ($last | Where-Object { $_ -match "auto-rotation" }).Count
    }
    if (Test-Path $compressionLog) {
        $last = Get-Content $compressionLog -Tail 10
        $summary.Compressions = ($last | Where-Object { $_ -match "BUFFER_COMPRESS" }).Count
        $lastComp = $last | Select-Object -Last 1
        if ($lastComp) {
            if ($lastComp -match "Original: (\d+) -> Compressed: (\d+)") {
                $summary.LastCompression = @{
                    Original = $matches[1]
                    Compressed = $matches[2]
                }
            }
        }
    }
    return $summary
}

# Gather content
$now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$milestones = Get-ReMilestones -LogPath $milestoneLog -HoursBack 24
$bufferStats = Get-BufferSummary

# Build digest object
$digest = [ordered]@{
    timestamp = $now
    type = $DigestType
    milestones = $milestones
    buffer = $bufferStats
}

# Save digest JSON
$digest | ConvertTo-Json -Depth 5 | Set-Content -Path $digestFile -Encoding UTF8

# Build embed message for #atlas
$lines = @()
$lines += "## 📊 Daily Digest — $DigestType ($(Get-Date -Format 'yyyy-MM-dd'))"
$lines += ""

if ($milestones.Count -eq 0) {
    $lines += "_No milestones to report._"
}
else {
    $lines += "### 🎯 Milestones (last 24h)"
    $milestones | ForEach-Object { $lines += "- $_" }
    $lines += ""
}

if ($bufferStats.Count -eq 0) {
    $lines += "_No buffer activity._"
}
else {
    $lines += "### 📦 Buffer Management"
    if ($bufferStats.ContainsKey('BufferRotations')) {
        $lines += "- Rotations: $($bufferStats.BufferRotations)"
    }
    if ($bufferStats.ContainsKey('Compressions')) {
        $lines += "- Compressions: $($bufferStats.Compressions)"
    }
    if ($bufferStats.ContainsKey('LastCompression')) {
        $orig = $bufferStats.LastCompression.Original
        $comp = $bufferStats.LastCompression.Compressed
        $saved = [math]::Round((1 - ($comp / $orig)) * 100, 1)
        $lines += "- Last compression: saved $saved%"
    }
    $lines += ""
}

$lines += "---"
$lines += "*Invisible Assistant — silent by design*"

$message = $lines -join "`n"

# Write to stdout (cron delivery will forward to channel if configured)
Write-Output $message
