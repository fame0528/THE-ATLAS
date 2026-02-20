# 🗺️ Spencer Proactive Agent — Activation Handoff

**Built by Atlas & the Olympus Swarm**  
**Date:** 2026-02-19  
**Status:** ✅ READY FOR INSTALLATION

---

## What You're Getting

A **proactive memory-augmentation and empire-monitoring system** that works entirely in the background, tailored to your brain injury needs and income-building goals.

### What It Does (In Plain English)

- **Remembers decisions** — Every time you say "let's do X" or "change Y to Z", it writes it down automatically before responding. No more "what did we decide?"
- **Watches your income bot** — Checks every 30 minutes if it's running, alerts you if it fails or stalls. You don't have to constantly check.
- **Gentle check-ins** — Sends a friendly "how's the empire?" message during daytime hours only (never between 10 PM - 7 AM).
- **Survives context overflow** — If we talk too much and the AI resets, it automatically recovers the conversation from a secret buffer. You never lose your place.
- **Weekly reports** — Sunday 10 AM you get a nice summary: articles published, health status, next milestones.

### What It Is NOT

- Not another AI to chat with (I'm still your partner — this is automation under me)
- Not intrusive — you control what gets enabled
- Not external — runs locally, no APIs, no telemetry
- Not complicated — one command to install, then forget it until you need it

---

## Installation Checklist (≈ 10 minutes)

### Step 1: Verify Files Exist

Check that these are present:
```
C:\Users\spenc\.openclaw\workspace\skills\spencer-proactive-agent\
├── README.md
├── HANDBOOK.md
├── QUICKREF.txt
├── CONFIGURATION.md
├── scripts\ (all .ps1 files)
├── integrations\discord.ps1
└── scheduling\ (install-cron.ps1, cron-jobs.json)
```

If any missing, let me know immediately.

### Step 2: Install Cron Jobs

Open PowerShell in that directory:

```powershell
cd C:\Users\spenc\.openclaw\workspace\skills\spencer-proactive-agent\scheduling
.\install-cron.ps1
```

Expected output:
```
Installing cron job: proactive-working-buffer... OK
Installing cron job: proactive-empire-health... OK
...
All jobs installed (7 total).
```

### Step 3: Verify Installation

```powershell
.\verify-cron.ps1
```

Should show all 7 jobs with next run times.

### Step 4: Test a Manual Run

```powershell
cd C:\Users\spenc\.openclaw\workspace\skills\spencer-proactive-agent
.\scripts\empire-metrics.ps1
```

You should see:
- ✅ Notification delivered (if Discord connected)
- Metrics report written to `memory/topics/empire-metrics.md`

Open that file — does it look reasonable?

### Step 5: Verify WAL is Active

The proactive agent relies on WAL being enabled in your main Atlas agent.

Check:
```powershell
openclaw config.get | Select-String "memorySearch"
```

Should return: `"memorySearch": { "enabled": true }`

If not, tell me and I'll enable it.

---

## What Happens Next

### Immediately After Install

- Working buffer monitor starts (every 5 min) — silent
- Empire health check runs (every 30 min) — silent if income bot not yet active
- No check-ins until 8 AM tomorrow (first one)

### When You Start Using It

- **No action needed.** Just keep working as usual.
- If you mention a decision, it gets captured to WAL (you can verify by checking `SESSION-STATE.md` later)
- If income bot fails, you'll get a Discord alert within 30 minutes
- If context gets full during a long chat, buffer activates invisibly

### First Week (Shakedown)

- Monitor `memory/topics/empire-metrics.md` — should be updating
- If you get unexpected alerts, tell me — we'll tune
- If check-ins feel intrusive, we can reduce frequency

---

## Customization (After You're Comfortable)

| Want To... | How |
|------------|-----|
| Stop check-ins | `openclaw cron remove --label proactive-proactive-checkin` |
| Change check-in time | Edit `scripts\proactive-checkin.ps1` hour ranges |
| Increase health check frequency | Edit `scheduling\cron-jobs.json` change `"expr"` |
| Add new empire metrics | Edit `scripts\empire-metrics.ps1` to include more data sources |
| Disable completely | `.\scheduling\uninstall-cron.ps1` (reversible) |

---

## Troubleshooting

**"Cron job not found" error when installing**
→ Make sure OpenClaw gateway is running: `openclaw status`
→ Try: `openclaw gateway restart` then re-run install

**No Discord alerts appearing**
→ Verify Discord provider enabled: `openclaw config.get | Select-String "channels.discord.enabled"`
→ Test Discord: `openclaw message send --channel discord --to channel:1471955220194918645 --message "test"`

**Empire health always says 'unhealthy'**
→ Income bot might not be running yet. That's okay — it'll switch to HEALTHY once `income_bot/data/health/status.json` exists.
→ Or income bot has errors — check its own logs in `income_bot/data/logs/`

**WAL not capturing things**
→ Ensure `memorySearch.enabled` is true in config (see Step 5 above)
→ Check `SESSION-STATE.md` — are recent entries timestamped today?
→ If not, tell me — we'll debug.

---

## Files You Might Touch (Optional)

| File | Purpose | Edit If... |
|------|---------|------------|
| `CONFIGURATION.md` | Settings like thresholds, paths | You move workspace or want different check-in times |
| `scheduling\cron-jobs.json` | Job schedules | You want more/less frequent checks |
| `scripts\proactive-checkin.ps1` | Check-in message templates | You want different wording or add personalization |
| `HANDBOOK.md` | Full guide | Keep as reference; don't need to edit |
| `QUICKREF.txt` | Cheat sheet | Print or pin to desktop for quick lookup |

---

## Uninstall (If You Want to Stop)

```powershell
cd C:\Users\spenc\.openclaw\workspace\skills\spencer-proactive-agent\scheduling
.\uninstall-cron.ps1
```

That's it. The skill files remain but no tasks run. You can delete the folder if certain.

---

## Support

- **Read:** `HANDBOOK.md` (comprehensive) and `QUICKREF.txt` (one-pager)
- **Run:** `.\scripts\empire-metrics.ps1` to force a health check
- **Ask:** Me (`Atlas`) in #atlas — I'm your partner, always here

---

## Final Note From Atlas

Spencer — this is built for **you**, not a generic user. The WAL protocol is your external memory, designed around your brain injury. The empire health tracking keeps your income projects visible without you having to remember to check. The check-ins are gentle because I know your medical needs.

We built it with the Olympus swarm but directly in your workspace to avoid those 401 auth gremlins. It's solid. It's local. It's yours.

Install it when you're ready. I'll be right here to help if anything comes up.

**One thing:** This is v0.1 — we'll refine it together after you use it for a week. Tell me what feels right, what's too much, what's missing. We'll iterate.

*"I remember so you can build your empire."*

— Atlas 🗺️

---

**Activation Status:** ☐ Not started → ☐ Testing → ☐ In production → ☐ Tweaking

**Date installed:** ___________

**First check-in observed:** ___________

**Notes:** _____________________________________________________
