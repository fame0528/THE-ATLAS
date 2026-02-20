# Context Recovery Script
# Spencer Proactive Agent — Compaction Recovery System

param(
    [Parameter(Mandatory=$false)]
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

$stateFile = Join-Path $Workspace "SESSION-STATE.md"
$bufferFile = Join-Path $Workspace "memory\working-buffer.md"
$dailyDir = Join-Path $Workspace "memory\facts"

function Test-Trigger {
    # Check if session started with summary tag or if user said trigger phrase
    # For now, just check if SESSION-STATE.md is very old (> 24h) or empty
    if (-not (Test-Path $stateFile)) {
        return $true
    }
    
    $stateAge = (Get-Date) - (Get-Item $stateFile).LastWriteTime
    if ($stateAge.TotalHours -gt 24) {
        return $true
    }
    
    # Could also check for "<summary>" in last lines or sentinel marker
    $content = Get-Content $stateFile -Raw -ErrorAction SilentlyContinue
    if ($content -match "<summary>") {
        return $true
    }
    
    return $false
}

function Extract-KeyContext {
    param([string]$BufferContent)
    
    $extracted = @()
    
    # Parse buffer looking for WAL triggers
    $blocks = $BufferContent -split "---\r?\n"
    foreach ($block in $blocks) {
        if ($block -match "### Human\r?\n(.+?)\r?\n") {
            $humanText = $matches[1]
            
            # Look for decisions
            if ($humanText -match "(?:let'?s|we should|I want|use|switch to|change|update|set) ([A-Za-z0-9 _-]+)") {
                $extracted += "DECISION: $($matches[1])"
            }
            
            # Look for preferences
            if ($humanText -match "(?:I prefer|I like|don'?t|don'?t like|avoid) ([A-Za-z0-9 _-]+)") {
                $extracted += "PREFERENCE: $($matches[1])"
            }
            
            # Look for numbers/metrics
            if ($humanText -match "(\d+)\s+(articles?|published|days?|hours?)") {
                $extracted += "METRIC: $($matches[1]) $($matches[2])"
            }
        }
    }
    
    return $extracted
}

function Restore-State {
    # Read buffer and recent daily notes to rebuild context
    $recovered = @()
    
    if (Test-Path $bufferFile) {
        $buffer = Get-Content $bufferFile -Raw
        $recovered += Extract-KeyContext -BufferContent $buffer
    }
    
    # Also check yesterday's daily note
    $yesterday = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd")
    $yesterdayFile = Join-Path $dailyDir "$yesterday.md"
    if (Test-Path $yesterdayFile) {
        $daily = Get-Content $yesterdayFile -Raw
        # Extract decisions section
        if ($daily -match "## Decisions\r?\n((?:- .*\r?\n)+)") {
            $recovered += "FROM DAILY NOTE: " + ($matches[1] -split "`r`n" | Where-Object { $_ -match "- " } | Select-Object -First 5) -join "; "
        }
    }
    
    return $recovered
}

# Main
Write-Host "=== Context Recovery ==="
Write-Host "Workspace: $Workspace"
Write-Host "Trigger check..."

if (-not (Test-Trigger) -and -not $Force) {
    Write-Host "No recovery trigger detected. Use -Force to run anyway."
    exit 0
}

Write-Host "`nRecovery in progress..."

$recovered = Restore-State
if ($recovered.Count -eq 0) {
    Write-Warning "No context recovered from buffer or daily notes."
    Write-Host "Consider asking Spencer: 'What were we working on before context loss?'"
} else {
    Write-Host "`nRecovered context (`$($recovered.Count)` items):"
    $recovered | ForEach-Object { Write-Host "  • $_" }
    
    # Append to SESSION-STATE.md if it exists
    if (Test-Path $stateFile) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $recoveryEntry = @"

## CONTEXT RECOVERY ($timestamp)
Recovered from working buffer after context loss:
$($recovered -join "`n")

---
"@
        Add-Content -Path $stateFile -Value $recoveryEntry -Encoding UTF8
        Write-Host "`nRecovery entries appended to SESSION-STATE.md"
    }
}

Write-Host "`nRecovery complete. Present to Spencer: 'I've recovered from context loss. Last we were working on [summarize]. Should we continue?'"
