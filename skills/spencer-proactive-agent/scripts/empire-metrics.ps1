# Empire Health Check (PS2-compatible)
param(
    [string]$IncomeBotPath = "C:\Users\spenc\.openclaw\workspace\income_bot",
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace"
)

$statusFile = Join-Path $IncomeBotPath "data\health\status.json"
$reportFile = Join-Path $Workspace "memory\topics\empire-metrics.md"
$script:alertSent = $false

# Load flow control helper (v2.0)
$assertFlow = Join-Path $PSScriptRoot "Assert-Flow.ps1"
$flowEnabled = $false
if (Test-Path $assertFlow) {
    . $assertFlow
    $flowEnabled = $true
}

function Get-HealthStatus {
    if (-not (Test-Path $statusFile)) {
        return @{ healthy = $false; message = "No health status file found."; last_run = $null; articles_published = 0; errors_last_24h = 0 }
    }
    try {
        $status = Get-Content $statusFile -Raw | ConvertFrom-Json
        return $status
    } catch {
        return @{ healthy = $false; message = "Parse error: " + $_.Exception.Message; last_run = $null; articles_published = 0; errors_last_24h = 0 }
    }
}

function Write-MetricsReport {
    param($status)

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $lastRun = if ($status.last_run) { $status.last_run } else { "Never" }
    $statusText = if ($status.healthy) { "HEALTHY" } else { "UNHEALTHY" }

    if ($status.healthy) {
        $recs = "- System operating normally`n- Continue monitoring`n- Consider increasing content cadence if metrics trending up"
    } else {
        $recs = "- Check income_bot logs for details`n- Verify Gemini API key is valid`n- Ensure GitHub repo is accessible"
    }

    $report = "# Empire Metrics Report`n"
    $report += "Generated: $timestamp`n"
    $report += "Status: $statusText`n`n"
    $report += "## Quick Stats`n"
    $report += "- Articles published: " + $status.articles_published + "`n"
    $report += "- Last successful run: $lastRun`n"
    $report += "- Errors (24h): " + $status.errors_last_24h + "`n"
    $report += "- Latest message: " + $status.message + "`n`n"
    $report += "## Recommendations`n$recs`n`n"
    $report += "---`n"
    $report += "*Next update: " + (Get-Date).AddHours(1).ToString('HH:mm') + "*`n"

    $report | Out-File -FilePath $reportFile -Encoding UTF8
    Write-Host "Metrics report written: $reportFile"
}

function Send-Alert {
    param([string]$Message, [string]$Level = "warning")
    
    # Respect flow state (high priority alerts can break through deep work but not quiet hours)
    if ($flowEnabled -and (Test-FlowAllowed -Priority "high" -Workspace $Workspace) -eq $false) {
        Write-Verbose "Alert suppressed due to flow state"
        return
    }
    
    $discordScript = Join-Path $Workspace "skills\spencer-proactive-agent\integrations\discord.ps1"
    if (Test-Path $discordScript) {
        $prefix = $Level.ToUpper()
        & $discordScript -Message "${prefix}: Empire Health - $Message"
        $script:alertSent = $true
    } else {
        Write-Warning "Discord not available: $Message"
    }
}

# Main
Write-Host "=== Empire Health Check ==="
$status = Get-HealthStatus

if (-not $status.healthy) {
    Write-Warning ("Unhealthy: {0}" -f $status.message)
    Send-Alert -Message $status.message
} else {
    Write-Host ("Healthy. Articles: {0}" -f $status.articles_published)
}

Write-MetricsReport -status $status

if ($script:alertSent) {
    Write-Host "Alert sent to Discord."
} else {
    Write-Host "No alerts needed."
}
