# Credential Vault — v2.0 Time-Savers
# Secure storage and retrieval of API keys and tokens (uses Windows Credential Manager)

param(
    [string]$Action,  # set, get, list, delete
    [string]$Name,
    [string]$Value,
    [string]$Target = "spencer-proactive-agent"
)

function Set-Credential {
    param($Name, $Value, $Target)
    $username = "$Target\$Name"
    $secure = ConvertTo-SecureString $Value -AsPlainText -Force
    New-Object System.Management.Automation.PSCredential($username, $secure) | Export-CliXml -Path "$env:TEMP\tempCred.xml"
    # Use cmdkey to store in Windows Credential Manager
    $cmd = "cmdkey /generic:$username /user:$username /pass:$Value"
    cmd /c $cmd | Out-Null
    Write-Host "Stored credential: $Name"
}

function Get-Credential {
    param($Name, $Target)
    $username = "$Target\$Name"
    $cmd = "cmdkey /list | findstr /i $username"
    $found = cmd /c $cmd 2>$null
    if ($found) {
        # Retrieve via cmdkey (returns masked)
        Write-Host "Credential exists: $Name"
        # To actually get the value, you'd need to decrypt; we'll just confirm existence
        return "***"  # Masked
    } else {
        Write-Host "Credential not found: $Name"
        return $null
    }
}

function List-Credentials {
    param($Target)
    $cmd = "cmdkey /list"
    $all = cmd /c $cmd 2>$null
    $all | Where-Object { $_ -like "*$Target*" } | ForEach-Object {
        $_.Trim()
    }
}

function Remove-Credential {
    param($Name, $Target)
    $username = "$Target\$Name"
    $cmd = "cmdkey /delete:$username"
    cmd /c $cmd | Out-Null
    Write-Host "Removed credential: $Name"
}

switch ($Action) {
    "set" {
        if (-not $Name -or -not $Value) { Write-Error "Usage: -Action set -Name <key> -Value <secret>"; exit 1 }
        Set-Credential -Name $Name -Value $Value -Target $Target
    }
    "get" {
        if (-not $Name) { Write-Error "Usage: -Action get -Name <key>"; exit 1 }
        $val = Get-Credential -Name $Name -Target $Target
        if ($val) { Write-Host "$Name = $val" }
    }
    "list" {
        List-Credentials -Target $Target
    }
    "delete" {
        if (-not $Name) { Write-Error "Usage: -Action delete -Name <key>"; exit 1 }
        Remove-Credential -Name $Name -Target $Target
    }
    default {
        Write-Host "Credential Vault — manages API keys/tokens via Windows Credential Manager"
        Write-Host "Usage:"
        Write-Host "  -Action set -Name <key> -Value <secret>"
        Write-Host "  -Action get -Name <key>"
        Write-Host "  -Action list"
        Write-Host "  -Action delete -Name <key>"
    }
}
