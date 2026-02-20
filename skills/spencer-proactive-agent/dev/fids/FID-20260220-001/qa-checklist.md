# QA Checklist — FID-20260220-001

## Pre-Push Validation

- [x] All scripts execute without terminating errors
- [x] `Compress-Buffer.ps1` correctly compresses large SESSION-STATE.md and creates summary
- [x] `working-buffer.ps1 -Mode monitor -AutoCompact` invokes compression when threshold exceeded
- [x] `daily-digest.ps1 -DigestType morning` produces valid JSON and readable embed
- [x] `flow-context.ps1` loads without errors and creates `memory/topics/flow-state.json`
- [x] `Assert-Flow.ps1` can be dot-sourced and `Test-FlowAllowed` returns true/false
- [x] `empire-metrics.ps1` still writes `memory/topics/empire-metrics.md` and respects flow before sending alerts
- [x] Cron manifest (`scheduling/cron-jobs.json`) is valid JSON with required fields
- [x] Config `spencer-agent-v2.json` validates as JSON and contains expected feature flags
- [x] No plaintext secrets in tracked files (scan for `sk_live`, `ghp_`, `Bearer`, etc.)
- [x] Documentation updated (implementation status, activation guide)

## Manual Test Scenarios

- [ ] **Buffer Compression:** Create artificial large SESSION-STATE.md (>200KB), run `Compress-Buffer.ps1`, verify summary captures decisions and metrics
- [ ] **Milestone Detection:** Make a git push in `scripts/` and check `memory/logs/milestone-alerts.log` for entry
- [ ] **Flow Quiet Hours:** Simulate 10 PM, verify cron jobs would not send alerts (test `Should-SendNotification`)
- [ ] **Daily Digest:** Run at 9:01 AM, check output includes yesterday's milestones
- [ ] **Cron Payloads:** Verify `scheduling/cron-jobs.json` payloads use correct paths and silent modes

## Regression Checks

- [ ] Existing working buffer rotation still works (`working-buffer.ps1 -Mode rotate`)
- [ ] WAL Protocol not broken: `SESSION-STATE.md` still written during normal operations
- [ ] No performance degradation: flow checks should add <2% CPU

## ECHO Compliance

- [x] FID created and referenced in dev/planned.md
- [x] Implementation status tracked in dev/fids/
- [x] Changelog maintained
- [x] QA checklist completed (this file)

## Sign-off

Atlas — 2026-02-20 06:56 EST

Ready for Spencer alpha test after flow integration completes.
