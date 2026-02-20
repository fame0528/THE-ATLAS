# Task Audit Logger
# Spencer Proactive Agent — Ensures no log loss even on crash

$logDir = Split-Path $MyInvocation.MyCommand.Path -Parent
$logFile = Join-Path $logDir "..\task-audit.log"

$scriptName = $MyInvocation.MyCommand.Name
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$argsString = $args -join " "

# Log entry format: TIMESTAMP | SCRIPT | ARGS | STATUS | DURATION_MS | ERROR
$startTime = Get-Date

try {
    # Execute the actual script if this is a wrapper (not used directly)
    # This file serves as a marker; actual scripts call Write-TaskAudit manually
    
    Write-Host "Task audit active. Logs to: $logFile"
}
catch {
    $errorMsg = $_.Exception.Message
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalMilliseconds
    
    $logEntry = "$timestamp | $scriptName | $argsString | FAILED | $([math]::Round($duration))ms | $errorMsg"
    Add-Content -Path $logFile -Value $logEntry -Encoding UTF8
    
    throw $_  # Re-throw
}

# Helper function for other scripts to call
function Write-TaskAudit {
    param(
        [string]$Status,  # "SUCCESS" or "FAILED"
        [string]$Message = ""
    )
    
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalMilliseconds
    
    $logEntry = "$timestamp | $scriptName | $argsString | $Status | $([math]::Round($duration))ms | $Message"
    Add-Content -Path $logFile -Value $logEntry -Encoding UTF8
}

# To use Write-TaskAudit from another script, dot-source this file:
#   . "C:\Users\spenc\.openclaw\workspace\skills\spencer-proactive-agent\scripts\task-audit.ps1"
#   Write-TaskAudit -Status "SUCCESS" -Message "Completed task"
