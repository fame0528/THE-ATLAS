# GitHub Shortcuts — v2.0 Time-Savers
# Quick GitHub operations: create PR, open issues, clone, etc.

param(
    [string]$Action,
    [string]$Repo = "fame0528/THE-ATLAS",
    [string]$Title,
    [string]$Body
)

$ghAvailable = Get-Command gh -ErrorAction SilentlyContinue
if (-not $ghAvailable) {
    Write-Error "GitHub CLI (gh) not found. Install from https://cli.github.com"
    exit 1
}

switch ($Action) {
    "pr" {
        # Create PR from current branch
        $branch = git branch --show-current
        gh pr create --base main --head $branch --title $Title --body $Body
    }
    "issue" {
        gh issue create --repo $Repo --title $Title --body $Body
    }
    "clone" {
        gh repo clone $Repo
    }
    "view" {
        gh repo view $Repo --web
    }
    "actions" {
        gh run list --repo $Repo
    }
    default {
        Write-Host "Available actions:"
        Write-Host "  -pr       : Create PR from current branch (use -Title and -Body)"
        Write-Host "  -issue    : Create issue (requires -Repo, -Title, -Body)"
        Write-Host "  -clone    : Clone repository (use -Repo)"
        Write-Host "  -view     : Open repo in browser (use -Repo)"
        Write-Host "  -actions  : List GitHub Actions runs"
    }
}
