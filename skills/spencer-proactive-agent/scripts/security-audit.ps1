# Security Audit — v2.0 Stealth Security
# Periodic security posture check: credentials, permissions, redaction, perimeter

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace"
)

$issues = @()

# 1. Check for plaintext secrets in tracked files (simple grep)
$sensitivePatterns = @(
    'sk_live_[\w\-]+',
    'ghp_[\w\-]+',
    'Bearer\s+[\w\-]+',
    'xoxb-[\w\-]+'
)

Write-Host "Scanning for secrets in repository..."
foreach ($pattern in $sensitivePatterns) {
    $matches = git grep -n $pattern 2>$null
    if ($matches) {
        $issues += "Potential secret pattern '$pattern' found in files. Review needed."
    }
}

# 2. Check permissions on sensitive folders
$secretPaths = @(".secrets", "credentials")
foreach ($path in $secretPaths) {
    $full = Join-Path $Workspace $path
    if (Test-Path $full) {
        $acl = Get-Acl $full
        foreach ($rule in $acl.Access) {
            if ($rule.IdentityReference -notlike "*$env:USERNAME*" -and $rule.FileSystemRights -ne "FullControl") {
                # Non-user access? flag
                $issues += "Suspicious ACL on $path: $($rule.IdentityReference)"
            }
        }
    }
}

# 3. Check if perimeter monitor state exists
$perimeterState = Join-Path $Workspace "memory/topics/perimeter-state.json"
if (-not (Test-Path $perimeterState)) {
    $issues += "Perimeter monitor state not initialized. Run perimeter-monitor.ps1 once."
}

# 4. Check credential vault for any entries marked as plaintext in config?
# Could check if config files contain placeholder API keys

# Generate report
if ($issues.Count -eq 0) {
    $report = "✅ **Security Audit** — No issues found. Keep it up."
} else {
    $report = "⚠️ **Security Audit** — $($issues.Count) issue(s):`n`n"
    $i = 1
    foreach ($issue in $issues) {
        $report += "$i. $issue`n"
        $i++
    }
    $report += "`nRecommendation: Address high-priority items immediately."
}

Write-Output $report
