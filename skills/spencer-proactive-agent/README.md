# Spencer's Proactive Agent 🗺️

**A memory-augmentation and empire-building assistant for Spencer (Atlas)**

This is a customized version of the Hal Labs Proactive Agent, fine-tuned for your specific needs: brain injury memory support, zero-cost income empire construction, and gentle, friendship-first check-ins.

---

## What This Is

An AI companion that **proactively helps** you build your empire while **remembering what matters** so you don't have to.

It does three things really well:

1. **Remembers for you** — Uses WAL (Write-Ahead Logging) to capture decisions, preferences, and metrics the moment you mention them. No more "what were we talking about?"

2. **Keeps the empire humming** — Monitors your Income Bot, tracks content production, and gives you health reports. Knows when things go wrong so you don't have to constantly check.

3. **Check-ins that respect your life** — Gentle prompts at sensible times (not during sleep), aligned with your medical routine and work rhythm.

---

## Why This Matters for You

**Your context:**
- Brain injury memory challenges → details slip away unless captured immediately
- Empire-building goal → passive income streams that compound
- Friendship over service → we're partners, not master/servant

**The agent fits you:**
- Writes first, responds second — captures corrections before context vanishes
- Works autonomously in the background — no babysitting
- Speaks your language — warm, concise, no corporate fluff
- Respects boundaries — no alerts during sleep hours, integrates with your existing self-care reminders

---

## Quick Start (5 Minutes)

### 1. Verify Prerequisites

You already have:
- ✅ OpenClaw installed and running
- ✅ Discord connected (#atlas is your home)
- ✅ Memory sync working (every 10 min)
- ✅ Income Bot codebase present (optional but recommended)

### 2. Install Cron Jobs

```powershell
cd C:\Users\spenc\.openclaw\workspace\skills\spencer-proactive-agent\scheduling
.\install-cron.ps1
```

This adds all scheduled checks to OpenClaw's cron system.

### 3. Enable WAL for Your Main Agent

Your main agent (Atlas) already has WAL capability. Activate it by ensuring:

```powershell
# Check your agent config
openclaw config.get | Select-String "memorySearch"
```

Should show `"memorySearch": { "enabled": true }`. If not, let me know and I'll enable it.

WAL happens automatically — no action needed beyond making sure you're reading `SESSION-STATE.md` before responding (OpenClaw core handles this).

### 4. Test It

Run a manual empire health check:
```powershell
cd C:\Users\spenc\.openclaw\workspace\skills\spencer-proactive-agent
.\scripts\empire-metrics.ps1
```

You should see:
- A file created at `memory/topics/empire-metrics.md`
- A Discord message in #atlas with the status

---

## What Gets Monitored (Automatically)

| Monitor | Frequency | What It Checks | Alert Condition |
|---------|-----------|----------------|-----------------|
| **Working Buffer** | Every 5 min | Context % > 60% | Silent — just buffers |
| **Empire Health** | Every 30 min | Income bot status, last run, errors | Fails or errors > 0 |
| **Daily Note** | Daily 8 AM | Yesterday's note exists | Missing note → gentle nudge |
| **Weekly Metrics** | Sunday 10 AM | Compile progress report | Sends summary to #atlas |
| **Monthly Review** | 1st 9 AM | Month-over-month trends | Sends reflection prompt |
| **Buffer Rotate** | Daily midnight | Archive old buffer | Silent maintenance |
| **Wellness Harmony** | Every 30 min | Self-care schedule, conflicts | Adjusts timing, no direct alert |

---

## File Structure

```
skills/spencer-proactive-agent/
├── README.md                   # This file
├── CONFIGURATION.md           # Spencer-specific settings
├── WAL-ENHANCEMENT.md         # Memory capture protocol
├── SECURITY-AUDIT.md          # Ares security review
├── INTEGRATION-GUIDE.md       # Setup instructions
├── HANDBOOK.md                # Daily use reference
├── QUICKREF.txt               # One-page cheat sheet
├── FAQ.md                     # Common questions
├── scripts/
│   ├── working-buffer.ps1     # Context danger zone logger
│   ├── recover-context.ps1    # Compaction recovery
│   ├── empire-metrics.ps1     # Income bot health check
│   ├── proactive-checkin.ps1  # Gentle nudge generator
│   ├── wellness-harmony.ps1   # Coordinate with self-care
│   ├── notify_progress.ps1    # Swarm persona progress reporter
│   ├── notify_simple.ps1      # Lightweight notification sender
│   ├── swarm_log.ps1          # Swarm activity logger
│   ├── task-audit.ps1         # Task execution audit logger
│   ├── security-audit.sh      # Security checks (bash)
│   └── test-simple.ps1        # Basic test script
├── integrations/
│   └── discord.ps1            # Discord notification wrapper
├── scheduling/
│   ├── cron-jobs.json         # Job definitions
│   ├── install-cron.ps1       # Add to OpenClaw
│   ├── verify-cron.ps1        # Check status
│   └── uninstall-cron.ps1     # Remove all
└── docs/ (mirrored in root)
    └── ( copies of above docs )
```

---

## Daily Rhythm (What to Expect)

**Morning (8 AM):** 
- Quick "did we log yesterday?" check (silent unless missing)
- No intrusive alerts — you're waking up

**Daytime (9 AM - 5 PM):**
- Empire health checks every 30 min (silent monitoring)
- Working buffer logging if you're in a long conversation
- Possible gentle check-in around lunch if system detects you're active

**Evening (6 PM - 10 PM):**
- Metrics summary compiled
- Weekly wrap-up on Sundays
- No alerts after 10 PM (respects sleep schedule)

**Night (10 PM - 7 AM):**
- Completely silent. Zero notifications.

---

## Your Interaction Model

**You do nothing differently.** The agent watches and helps in the background. The only thing you need to do is:

1. **If you mention something important** — I (Atlas) will capture it to WAL automatically. That's it.

2. **If context overflows** — The working buffer ensures recovery. You might see a "recovered from buffer" message once and then we continue.

3. **If income bot fails** — You'll get a Discord alert in #atlas within 30 minutes.

4. **You can disable anytime:**
   ```powershell
   openclaw cron remove --label "proactive-*"
   ```
   Then stop running the scripts. Clean exit.

---

## Why It's Built for You (Not Generic)

| Generic Agent | Spencer's Proactive Agent |
|---------------|---------------------------|
| Uses all features | Stripped down (no agent networks, no external APIs) |
| One-size-fits-all triggers | Empire metrics, income bot health, memory augmentation |
| Max notifications | Respects sleep, coordinates with self-care |
| Complex config | Works out of the box; just install cron |
| External dependencies | 100% local, uses OpenClaw and PowerShell only |
| Corporate tone | Warm, friendship-first, no fluff |

---

## Troubleshooting

**"I'm getting too many alerts!"**
- Run: `.\scheduling\uninstall-cron.ps1` then selectively reinstall only needed jobs
- Or edit `cron-jobs.json` to reduce frequency

**"WAL doesn't seem to be capturing things."**
- Check `SESSION-STATE.md` — are recent entries present?
- Verify memory sync is running (check cron list for "Sync Memory")
- Try: `.\scripts\recover-context.ps1 -Force` to manually rebuild

**"Income bot health says not installed."**
- That's okay if you haven't activated it yet. The check will pass automatically once `income_bot/data/health/status.json` exists.
- Or set up income bot first, then enable this agent.

**"Can I turn off the check-ins?"**
- Yes: `openclaw cron remove --label proactive-proactive-checkin` (exact label from cron-jobs.json)
- Or keep but edit `scripts\proactive-checkin.ps1` to early-exit always.

---

## Support

- **Handbook:** `HANDBOOK.md` — daily use deep dive
- **Quick Ref:** `QUICKREF.txt` — one-page cheat sheet
- **FAQ:** `FAQ.md` — common questions answered
- **Or ask me** (`Atlas`) directly in #atlas — I'm here to help.

---

## License & Credits

Adapted from Hal Labs Proactive Agent v3.1.0 (MIT)
Spencer-optimized by Atlas (your AI partner) — 2026-02-19
Part of the Olympus Swarm architecture.

*"I remember so you can build your empire."*
