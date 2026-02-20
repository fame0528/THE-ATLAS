# 🦉 RHYTHM INTELLIGENCE — Spencer-Centered Design

**Persona:** Athena (Architect & Code Reviewer)
**Mission:** Design a "Daily Rhythm Map" that adapts to Spencer's actual life patterns, not a generic schedule.

---

## 📍 Spencer's Known Patterns (From Brief)

- **Wake:** 8-9 AM
- **Wind-down:** ~10 PM (evening routine)
- **Deep Work:** Morning/afternoon blocks, often 2-4 hours
- **Memory Challenges:** Needs reminders for self-care (teeth, meds), daily note creation
- **Context Usage:** Heavy during coding/design; 256k window fills fast
- **Communication:** Prefers concise updates; tolerates warnings only when actionable
- **Noise Preference:** Hates spam; values silence over notifications
- **Motivation:** Sees tangible results (dashboards, completed tasks)

---

## 🧠 Rhythm Intelligence Architecture

### 1. **Passive Rhythm Detection**
The agent observes (not interrupts) to learn:
- Sleep patterns via last active timestamp (winds down ~10 PM, wakes ~8-9 AM)
- Deep work detection: sustained coding activity (>30 min without Discord pings)
- Context window velocity: spikes during design/coding sessions
- Natural break points: when Spencer stops typing, switches to Discord, or runs a script

```powershell
# Example detection logic
$deepWorkThreshold = 30 # minutes of continuous activity
$contextSpikeRate = 5   # KB/min increase in SESSION-STATE.md
$naturalBreakPause = 5  # minutes of inactivity = potential break
```

### 2. **Adaptive Intervention Timing**
Interventions only when:
- **Context window > 200k** → Offer to summarize or compress buffer
- **90+ minutes of deep work** → "You've been coding for 1.5h. Want a break nudge in 15 min?"
- **Approaching wind-down (9:30 PM)** → "Evening routine reminder: meds, teeth, journal?"
- **Morning start (8-9 AM)** → "Daily note created? Today's empire goals set?"

**Never** interrupt:
- During active typing (detected via recent file writes)
- Within 30 min of previous notification
- During known "maker hours" (morning/afternoon deep work)
- After 10 PM (quiet hours enforced by Kronos)

### 3. **Daily Rhythm Map Output**
A living map Spencer can view anytime (`atlas rhythm`):

```
🗓️ Spencer's Rhythm — Feb 19, 2026

┌─────────────┬──────────────┬────────────────────────────┐
│ Period      │ Status       │ Notes                      │
├─────────────┼──────────────┼────────────────────────────┤
│ 08:00-09:30 │ Deep Work    │ Income Bot refactor        │
│ 09:30-10:00 │ Break        │ Coffee, Discord check      │
│ 10:00-12:30 │ Deep Work    │ Context window: 180k       │
│ 12:30-13:00 │ Lunch        │ Away from keyboard         │
│ 13:00-15:00 │ Deep Work    │ Testing GitHub Actions     │
│ 15:00-15:30 │ Natural Break │ Buffer full, auto-summary  │
│ 21:30-22:00 │ Wind-down    │ Prepping for sleep         │
│ 22:00       │ Quiet Hours  │ Notifications silenced     │
└─────────────┴──────────────┴────────────────────────────┘
```

### 4. **Context Spike Intervention**
When context fills rapidly (coding sprints):
- **Auto-summary proposal:** "I can compress your working buffer into a daily note. Save ~50k?"
- **Milestone checkpoint:** "You just pushed to GitHub. Update empire metrics?"
- **Decision cache:** "Last 10 decisions captured. Replay later?"

### 5. **Memory Prosthetics Integration**
With Mnemosyne:
- When Spencer revisits a task after >24h, whisper: "Last time you chose Option A. Here's why..."
- Habit streak display: "Daily note streak: 7 days 🔥"
- Routine nudge: "Teeth meds not logged today. Want reminder?" (quiet, one-time)

---

## 📐 Implementation Plan

**Phase 1 (Week 1):** Passive detection only. No interruptions. Log rhythm for 7 days.
**Phase 2 (Week 2):** Soft probes at natural breaks: "Is this a good time to summarize?"
**Phase 3 (Week 3):** Active intervention during context spikes, but only with prior opt-in.
**Phase 4 (Week 4):** Full rhythm map + auto-summary + memory replay.

---

## 🎯 Success Metrics (Spencer-Focused)
- **Reduced context overflow incidents:** from 3/week → 0/week
- **Daily note completion rate:** >90%
- **Self-care routine adherence:** >80%
- **Notification tolerance:** <1 "that was annoying" per week
- **Deep work preservation:** >90% of maker hours uninterrupted

---

*Design by Athena — built for Spencer's actual brain, not a generic schedule.*