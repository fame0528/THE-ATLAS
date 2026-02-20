# 🚀 v2.0 Phase 1 Activation Guide

**Status:** Alpha — Ready for Testing
**Date:** 2026-02-20
**Target:** Foundation upgrades (Invisible Assistant + Flow Scheduling + Dashboard + Time-Savers + Proactive Docs)

---

## 📦 What's Been Built

### ✅ Completed (Ready Now)
1. **Buffer Auto-Compression Engine** — `scripts/Compress-Buffer.ps1`
   - Compresses SESSION-STATE.md at 200KB threshold
   - Summarizes decisions/metrics to `memory/topics/active-session.md`
   - Logs to `memory/logs/buffer-compression.log`

2. **Integration into Working Buffer** — `scripts/working-buffer.ps1` updated
   - Monitors SESSION-STATE.md size and triggers compression automatically
   - Existing token-based rotation unchanged

3. **Milestone Detection Scaffolding** — Working buffer monitor
   - Git push detection (in `scripts/` and `income_bot/`)
   - Build success/failure check (from `logs/build.log`)
   - Deep work timer (4h completion heuristic)
   - Self-care miss detection (checks `memory/self-care/YYYY-MM-DD.json`)
   - All milestones logged to `memory/logs/milestone-alerts.log`

4. **Daily Digest Batcher** — `scripts/daily-digest.ps1`
   - Collects milestones + buffer stats from last 24h
   - Formats as embed for #atlas
   - Three daily batches: 9 AM, 2 PM, 9 PM

5. **Flow Context Module** — `scripts/flow-context.ps1`
   - Quiet hours detection (10 PM - 7 AM)
   - Deep work detection (typing, git push, DND, buffer spike)
   - Natural break detection (5+ min inactivity)
   - Notification routing decisions (`Should-SendNotification`, `Get-TargetChannel`)
   - State persistence to `memory/topics/flow-state.json`

6. **Flow Assert Helper** — `scripts/Assert-Flow.ps1`
   - `Test-FlowAllowed` function for scripts to respect flow
   - Auto-initializes flow context

7. **Empire Metrics Flow Guard** — `scripts/empire-metrics.ps1`
   - Sends Discord alerts only if flow allows (high priority)
   - Still writes metrics report always

8. **Cron Manifest Updates** — `scheduling/cron-jobs.json`
   - New jobs: `buffer-compress` (every 5 min), `daily-digest` (3x daily)
   - Existing jobs ready for flow integration (payload modifications pending)

9. **v2.0 Configuration** — `config/spencer-agent-v2.json`
   - Feature flags for all Phase 1-3 upgrades
   - Toggle any component on/off without code changes

10. **Phase 1 Initialization** — `scripts/Initialize-v2.Upgrades.ps1`
    - Sets up required directories
    - Creates placeholder files
    - Validates environment

11. **Implementation Tracker** — `IMPLEMENTATION-TRACKER.md`
    - Progress visibility
    - Task checklist

12. **All 10 Deliverable Documents** — `upgrades/` folder
    - Complete design specs for all persona upgrades
    - Roadmap with 30-60-90 day plan

### 🔄 In Progress (Next Up)
- ✅ **Flow-Aware Scheduling Integration** — All cron jobs now respect quiet hours (10 PM-7 AM), deep work detection, and natural breaks. Scripts: `flow-context.ps1`, `Assert-Flow.ps1`, updated `working-buffer.ps1`, `empire-metrics.ps1`, `wellness-harmony.ps1`, plus new `daily-note-check.ps1`, `weekly-metrics.ps1`, `monthly-review.ps1`.
- ✅ **Adaptive Frequency** — Empire health check runs every 30 min but skips based on stability (state stored in `memory/topics/empire-health-state.json`).
- ⏳ **Persona Routing** — Cron outputs currently use #last; should route to #hyperion, #epimetheus, etc. (postpone)
- ⏳ **Personal Dashboard UI** — Build the HTML dashboard (`dashboard/index.html`) with TL;DR grid and color coding.
- ⏳ **Time-Savers Integrations** — Auto-Obsidian sync, skill auto-registration, one-click Discord, GitHub shortcuts, credential vault.
- ⏳ **Proactive Documentation Engine** — Git push detector, auto-README updates, wiki sync, empire registry auto-maintenance.
- ⏳ **Testing & Alpha Validation** — Unit tests, flow simulation, Spencer alpha feedback (2 weeks).

---

## 🎯 Quick Start (5 min)

### 1. Run Initialization

```powershell
cd C:\Users\spenc\.openclaw\workspace\skills\spencer-proactive-agent
.\scripts\Initialize-v2.Upgrades.ps1
```

This creates:
- `memory/topics/active-session.md` (session summaries)
- `memory/logs/buffer-compression.log` (compression events)
- `memory/buffer-archive/` (rotated buffers)
- Writes `.initialized-v2` marker

### 2. Test Buffer Compression (Manual)

First, make your SESSION-STATE.md large (e.g., by having a long conversation). Then:

```powershell
.\scripts\Compress-Buffer.ps1
```

Expected output:
```
🧠 Buffer compression triggered: 234567 bytes > 200000 bytes
📝 Summary written to: C:\...\memory\topics\active-session.md
✅ Buffer compressed to 50 lines (12345 bytes)
```

Check that:
- Summary file contains recent decisions and metrics
- SESSION-STATE.md is now smaller (<200KB)
- No errors in log

### 3. Enable Feature Flags

Edit `config/spencer-agent-v2.json` to enable/disable features:

```json
{
  "features": {
    "invisible-assistant": { "enabled": true },
    "flow-aware-scheduling": { "enabled": true },
    "personal-dashboard": { "enabled": false }  // enable when UI ready
  }
}
```

---

## ⚙️ Integration Points

### With Existing Working Buffer

Currently, `working-buffer.ps1` handles token-based rotation of `memory/working-buffer.md`. The new `Compress-Buffer.ps1` handles file-size-based compression of `SESSION-STATE.md`.

To integrate:
1. Modify `working-buffer.ps1` to call `Compress-Buffer.ps1` when `$AutoCompact` is true
2. Or schedule `Compress-Buffer.ps1` as a separate cron job that runs every 5 minutes

**Recommended:** Add to cron (phase 1 install script will do this).

### With Cron System

Phase 1 cron jobs (run `install-cron.ps1` when ready):

| Job | Schedule | Script | Purpose |
|-----|----------|--------|---------|
| `buffer-monitor` | Every 5 min | `working-buffer.ps1 -AutoCompact` | Check context %, rotate if needed |
| `buffer-compress` | Every 5 min | `Compress-Buffer.ps1` | Check SESSION-STATE.md size, compress if >200k |
| `empire-metrics` | Every 30 min | `empire-metrics.ps1` | Update Hyperion dashboard |
| `daily-note-check` | 9:00 AM daily | `proactive-checkin.ps1 -Type DailyNote` | Nudge if daily note missing |
| `wellness-harmony` | 9:30 PM daily | `wellness-harmony.ps1` | Evening routine check |

---

## 🧪 Testing Checklist

- [ ] `Initialize-v2.Upgrades.ps1` runs without errors
- [ ] `Compress-Buffer.ps1` successfully compresses a large SESSION-STATE.md
- [ ] Summary file contains relevant decisions and metrics
- [ ] Buffer archive directory populated after compression
- [ ] Log file updated with compression event
- [ ] Feature flags read correctly (try disabling invisible-assistant, re-run)
- [ ] No interference with existing working-buffer.ps1 operations

---

## 📊 Monitoring

**Logs to watch:**
- `memory/logs/buffer-compression.log` — compression events
- `memory/logs/buffer-auto-rotate.log` — working buffer rotations (existing)
- `memory/logs/empire-metrics.log` — dashboard updates (when enabled)

**Commands:**
- `.\scripts\working-buffer.ps1 -Mode test` — sanity check working buffer
- `.\scripts\Compress-Buffer.ps1` — manual trigger
- `atlas status` — see overall context usage

---

## 🎯 Success Criteria (Phase 1 Alpha)

- Context overflow incidents: **0 per week**
- Annoyance reactions ("stop interrupting"): **<1 per week**
- Daily note adherence: **>90%**
- Buffer compression: **automated, no manual intervention needed**
- Quiet hours violations: **0**

If any metric fails → adjust thresholds or disable offending feature via config.

---

## 🆘 Rollback

To disable v2.0 temporarily:

1. Set all feature flags to `false` in `config/spencer-agent-v2.json`
2. Remove Phase 1 cron jobs: `.\scheduling\uninstall-cron.ps1` (or selectively)
3. Rename `.initialized-v2` to `.initialized-v2.disabled`

To re-enable: set flags back to `true`, re-run `install-cron.ps1`.

---

## 📚 Documentation

- **Design Specs:** `upgrades/` folder (10 persona documents)
- **Roadmap:** `upgrades/SPENCER-PROACTIVE-AGENT-v2.0-ROADMAP.md`
- **Implementation Tracker:** `IMPLEMENTATION-TRACKER.md`
- **Configuration Reference:** `config/spencer-agent-v2.json` (self-documenting)

---

## 🙋 Questions?

Ask `Atlas` in #atlas or review the Handbook (`HANDBOOK.md`) for deeper v1.0 background.

---

*"Building Spencer's co-pilot, one invisible upgrade at a time."* — Atlas 🗺️