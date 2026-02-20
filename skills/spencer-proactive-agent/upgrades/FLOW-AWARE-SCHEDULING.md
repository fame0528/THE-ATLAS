# ⏳ FLOW-AWARE SCHEDULING — Spencer's Rhythm, Not a Rigid Timetable

**Persona:** Kronos (Automation & Scheduler)
**Mission:** Schedule agent activities around Spencer's flow, not the other way around. Respect deep work, cluster notifications, enforce quiet hours.

---

## ⏰ Spencer's Natural Rhythm (From Brief)

- **Wakes:** 8-9 AM
- **Deep Work:** Morning/afternoon blocks, often 2-4 hours uninterrupted
- **Evening Routine:** ~10 PM wind-down
- **Quiet Hours:** 10 PM - 7 AM (no interruptions)
- **Communication Style:** Concise, hates spam, prefers silence over noise
- **Preferred Check-ins:** Only when something genuinely needs attention

---

## 🌊 Flow-Aware Principles

### 1. **Quiet Hours (Non-Negotiable)**
**10:00 PM - 7:00 AM:**
- Zero notifications to Spencer (unless emergency)
- All agent monitoring runs silently
- Logs written, not posted
- Buffer auto-summary *queued* for morning delivery

**Override:** Only for critical alerts (server down, revenue emergency) — still use embed, but tag as `[URGENT]`.

---

### 2. **Deep Work Protection**
Detect deep work mode → suppress all non-critical alerts.

**Detection:**
- Active typing for >15 consecutive minutes
- `git push` or script execution in past 30 min
- Discord status: "do not disturb" or no recent messages
- Buffer size increasing rapidly (>1k/min)

**While in deep work:**
- Cron jobs still run, but results go to `#system-status` only
- Hyperion dashboard updates quietly
- Proactive suggestions (Athena, Mnemosyne) buffer until Spencer types `atlas check`
- Emergency alerts still come through (defined: system down, revenue > threshold)

---

### 3. **Notification Clustering**
Spencer tolerates batch updates. **Never** one-by-one.

**Batching schedule:**
- **Morning digest (9:00 AM):** Overnight health, yesterday's summaries, today's agenda
- **Afternoon check-in (2:00 PM):** Deep work progress, any blockers
- **Evening wrap-up (9:00 PM):** Today's achievements, tomorrow's preview
- **On-demand:** `atlas status` anytime

Each batch is a single rich embed with sections, not 10 pings.

---

### 4. **Adaptive Frequency**
How often empire health checks run depends on system stability:

| System State | Health Check Cadence | Notification Threshold |
|--------------|--------------------|------------------------|
| Building/Unstable | Every 30 min | Alert on any failure |
| Stable/Normal | Every 2 hours | Alert on failure + cumulative 3 failures |
| Rock Solid | Every 4 hours | Daily summary only |

**Automatic promotion/demotion** based on error rate.

---

### 5. **Natural Break Detection**
Schedule agent check-ins for *when Spencer naturally pauses*:

**Triggers:**
- 5+ minutes of inactivity (no keyboard/mouse)
- Discord activity spike (likely reading messages)
- After `git push` (sense of completion)
- After `#done` tag used in daily note

At these moments:
- Offer buffer summary if context >180k
- Suggest daily note creation if not done
- Nudge evening routine at 9:30 PM (not before)

---

### 6. **Cron Job Redesign**

**Current cron:** Too many jobs, noisy.

**New schedule (Flow-aware):**

| Job | Schedule | Deliver To |
|-----|----------|------------|
| `empire-metrics` | Every 2h (adaptive) | #hyperion (not #atlas) |
| `buffer-monitor` | Every 15 min | `memory/topics/buffer-status.json` (silent) |
| `daily-note-check` | 9:00 AM daily | #atlas (only if not created) |
| `wellness-harmony` | 9:30 PM daily | #atlas (evening routine) |
| `weekly-metrics` | Monday 8:00 AM | #atlas (sprint summary) |
| `context-compact` | Sunday 3:00 AM (quiet) | logs only |
| `experiment-check` | Every 4h | Prometheus channels |

**Rule:** All cron outputs go to persona channels first. Atlas only gets elevations.

---

## 🎯 Cron Job Examples

### Empire Metrics (Adaptive)
```powershell
# skills/spencer-proactive-agent/scripts/empire-metrics.ps1
$state = Get-Content "memory/topics/empire-state.json" | ConvertFrom-Json
if ($state.instability -gt 0.3) {
    $interval = "30m"
} elseif ($state.instability -lt 0.1) {
    $interval = "4h"
} else {
    $interval = "2h"
}
# Update Hyperion dashboard, log to file, no ping unless red
```

### Daily Note Check (9 AM)
```powershell
if (-not (Test-Path "memory/$(Get-Date -Format yyyy-MM-dd).md")) {
    # Only ping if Spencer is likely awake (after 8:30 AM)
    $hour = (Get-Date).Hour
    if ($hour -ge 8 -and $hour -le 22) {
        Send-AtlasEmbed -Message "📓 Daily note not created yet. Your empire deserves recording."
    }
}
```

---

## 📱 Spencer Controls

Spencer can adjust flow settings via simple commands:

- `atlas flow deep` → enable deep work mode (all notifications silent except URGENT)
- `atlas flow normal` → return to adaptive schedule
- `atlas quiet until 8am` → extend quiet hours
- `atlas batch now` → force immediate batch digest

---

## 🧪 Testing Flow

Kronos tests:
1. **Deep work simulation** — start coding session, verify no pings for 2h
2. **Quiet hours enforcement** — set system to 2 AM, confirm zero logs to #atlas
3. **Batching** — trigger 5 alerts, verify they arrive as 1 embed
4. **Adaptive schedule** — simulate system instability, check health check frequency increases

---

## 📊 Metrics

- **Deep work hours protected:** Target >15h/week
- **Notification count:** <5/day total (excluding emergencies)
- **Quiet hours violations:** 0/week
- **Batch efficiency:** 80%+ of alerts batched, not real-time

---

⏳ *Kronos — your time, respected.*