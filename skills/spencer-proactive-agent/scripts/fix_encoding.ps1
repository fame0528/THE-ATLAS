$path = "C:\Users\spenc\.openclaw\workspace\skills\spencer-proactive-agent\scripts\swarm_log.ps1"
if (Test-Path $path) {
    $content = Get-Content $path -Raw
    # Save with BOM (UTF8 in PS 5.1 adds BOM by default)
    Set-Content -Path $path -Value $content -Encoding UTF8
    Write-Host "Fixed encoding for $path"
}
else {
    Write-Host "File not found: $path"
}
