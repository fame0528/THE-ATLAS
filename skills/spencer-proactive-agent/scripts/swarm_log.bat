@echo off
REM Swarm Log Wrapper
REM Forces ExecutionPolicy Bypass and Correct Path
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0swarm_log.ps1" %*
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Swarm Log Failed with Exit Code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)
