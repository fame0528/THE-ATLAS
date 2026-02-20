# Assert-Flow.ps1 - v2.0 Flow-Aware Scheduling
# Provides Test-FlowAllowed function for scripts to respect Spencer's flow

param()

$script:FlowModuleLoaded = $false

function Initialize-FlowContext {
    param([string]$Workspace = "C:\Users\spenc\.openclaw\workspace")
    $flowModule = Join-Path $Workspace "skills\spencer-proactive-agent\scripts\flow-context.ps1"
    if (Test-Path $flowModule) {
        . $flowModule
        $script:FlowModuleLoaded = $true
    }
}

function Test-FlowAllowed {
    param(
        [string]$Priority = "normal",  # emergency, high, normal
        [string]$Workspace = "C:\Users\spenc\.openclaw\workspace"
    )
    
    if (-not $script:FlowModuleLoaded) {
        Initialize-FlowContext -Workspace $Workspace
    }
    
    if (-not $script:FlowModuleLoaded) {
        return $true  # No flow module, allow by default
    }
    
    $shouldSend = $false
    switch ($Priority) {
        "emergency" { $shouldSend = $true }
        "high" {
            $isQuiet = Test-QuietHours
            $shouldSend = -not $isQuiet
        }
        "normal" {
            $shouldSend = Should-SendNotification -Priority "normal"
        }
    }
    
    return $shouldSend
}

# Auto-initialize when dot-sourced
Initialize-FlowContext

