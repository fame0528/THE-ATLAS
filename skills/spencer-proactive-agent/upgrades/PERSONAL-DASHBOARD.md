# 🔭 PERSONAL DASHBOARD — Spencer's One-Glance Empire Health

**Persona:** Hyperion (Data Analyst & Monitoring)
**Mission:** Build a single-screen view that shows Spencer everything he needs to know about his empire *and* himself, at a glance.

---

## 🎯 Spencer's Dashboard Needs

**He don't want to:**
- Open 5 different apps to see his status
- Read paragraphs of text
- Manually calculate progress
- Check multiple Discord channels

**He does want:**
- One place, one glance, "how am I doing?"
- Clear red/yellow/green indicators
- Clickable details when he wants depth
- His health (sleep, routine) alongside his empire KPIs

---

## 📐 Dashboard Layout

### **Primary View (TL;DR)**
```
┌─────────────────────────────────────────────────────────────┐
│  🗺️ SPENCER'S EMPIRE — LIVE                                │
├─────────────┬─────────────┬─────────────┬─────────────┤
│  📝 Articles│  🔧 Systems │  💰 Income  │  🧠 Health  │
│     3       │     5       │    $X       │    86%      │
│  this week  │   stable    │  this month │    today    │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ 🎯 Milestones│  😌 Mood    │  💤 Sleep   │  📊 Focus   │
│     4 done   │   😊 Good   │   7h avg    │   3.2h      │
│   this sprint│             │   last 7d   │  deep work  │
├─────────────┴─────────────┴─────────────┴─────────────┤
│  🔔 Notifications: 0 outstanding  │  📅 Next: Daily note│
└─────────────────────────────────────────────────────────────┘
```

**Color coding:**
- 🟢 Green = on/above target
- 🟡 Yellow = needs attention soon
- 🔴 Red = urgent (Spencer should act)
- ⚪ Gray = no data / inactive

---

## 📊 Metric Definitions & Sources

### Empire Pillars

| Metric | Source | Target | Refresh |
|--------|--------|--------|---------|
| Articles | Count new `.md` in `Resources/Research/` + published posts | 2/week | Hourly |
| Systems Stable | Count systems marked "stable" in `SYSTEMS.md` | +1/month | Daily |
| Income Streams | Active revenue sources with earnings last 30d | 3+ | Daily |
| Income Amount | Sum of earnings from all streams | $100+/mo | Daily |
| Milestones Done | Tasks with `#done` in last 7 days | 3/week | Real-time |
| GitHub Commits | Push count to any repo | 5+/week | Real-time |

### Cognitive Health

| Metric | Source | Target | Refresh |
|--------|--------|--------|---------|
| Daily Note % | Days with note in `memory/YYYY-MM-DD.md` | 95% | Daily |
| Context Overflows | Count buffer >256k events | 0/week | Real-time |
| Deep Work Hours | Active coding/design >30 min blocks | 10h/week | Daily |
| Self-Care Adherence | Meds + teeth logged daily | 90% | Daily |
| Routine Completion | Evening routine completed | >80% | Daily |
| Sleep Duration | Avg hours (from bedtime tracker or estimate) | 7h+ | Daily |

### Agent Value

| Metric | Source | Target | Refresh |
|--------|--------|--------|---------|
| Tasks w/o Reminder | Tasks completed before agent nudge | +5/week | Daily |
| Friction Saved | Hours saved via Hermes integrations (self-report) | 3h/week | Weekly survey |
| Decision Replay Helpfulness | Spencer rating (1-5) on Mnemosyne usefulness | 4+ | Weekly prompt |
| Dashboard Glances | `atlas dashboard` command usage | 3+/day | Real-time |
| Notification Annoyance | Explicit "stop" commands | 0/week | Real-time |

---

## 🔄 Data Pipeline

**Sources:**
- `SESSION-STATE.md` (activity tracking)
- `memory/` daily notes and topics
- `skills/spencer-proactive-agent/logs/` (agent metrics)
- GitHub API (commits, issues, releases)
- Income Bot database (revenue tracking)
- Self-care logs (meds/teeth entries)
- Obsidian daily notes (routine completion)

**Aggregator:** `Hyperion/scripts/Update-Dashboard.ps1` runs every 30 min, writes to `dashboard/latest.json`

**Render:** `dashboard/index.html` (single-page, auto-refresh) served locally via `openclaw dashboard` or viewed in browser.

---

## 🎨 Detail Views

Click any tile to drill down:

### Articles Detail
```
📝 Articles — Feb 2026
✅ 3 published (2 research, 1 income_bot guide)
📊 1,200 total views
💰 5 affiliate clicks → $X
🕒 Avg time to write: 4h
Next: Gumroad launch post (due Feb 25)
```

### Systems Detail
```
🔧 Systems Status
✅ income_bot v0.2 — STABLE (uptime 99.9%)
✅ Proactive Agent v2.0 — DEPLOYING
🔄 Context Guardian — MONITORING
⏳ gumroad-automation — BUILDING
❓ skill-upgrader — IDLE
```

### Health Detail
```
🧠 Cognitive Health — This Week
😴 Sleep: 7.2h avg (good)
📓 Daily notes: 7/7 (100%)
💊 Self-care: 6/7 days (86%)
🎯 Deep work: 13h (above target)
🧠 Overflows: 0 (perfect)
```

---

## 📱 Access Patterns

Spencer can view dashboard:
1. **In Discord:** `atlas dashboard` → posts embed with snapshot + link
2. **Browser:** `file:///C:/Users/spenc/.openclaw/workspace/skills/spencer-proactive-agent/dashboard/index.html`
3. **Voice:** TTS summary each morning (configurable)
4. **Mobile:** Obsidian sync? maybe

**Auto-post:** Daily at 8 AM to `#hyperion` channel with previous day's roundup.

---

## 🚨 Alert Thresholds (Override Invisibility)

When metric goes red:
- Spell danger: 2+ days without daily note
- Income drop: >50% decrease week-over-week
- System outage: Any "offline" >15 min
- Sleep deficit: <6h average for 3 days

**Alert goes to:** `#atlas` (rich embed) — Spencer's home base. One line, actionable.

---

## 🧪 Validation

Hyperion tracks:
- Dashboard view frequency
- Click-through rates on drilldowns
- Time spent on page
- Spencer's satisfaction ratings (monthly quick poll)

Goal: **Spencer checks it daily** because it's useful, not because he's nagged.

---

🔭 *Hyperion — bringing the empire into focus.*