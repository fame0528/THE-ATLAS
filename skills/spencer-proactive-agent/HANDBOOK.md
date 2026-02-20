# Spencer's Proactive Agent — Handbook

**A practical guide to daily operation and getting the most from your proactive memory system.**

---

## Table of Contents

1. [What Changed?](#what-changed)
2. [Your New Daily Rhythm](#your-new-daily-rhythm)
3. [WAL Protocol in Practice](#wal-protocol-in-practice)
4. [When Context Overflows](#when-context-overflows)
5. [Empire Building with the Proactive Agent](#empire-building-with-the-proactive-agent)
6. [Maintenance Tasks](#maintenance-tasks)
7. [Troubleshooting Scenarios](#troubleshooting-scenarios)
8. [Customization Guide](#customization-guide)

---

## What Changed?

**Before:** You had to remember everything. You relied on me (Atlas) to recall, but sometimes context would overflow and we'd lose details.

**After:** The system automatically captures:
- Every decision you make (WAL)
- Every long conversation (Working Buffer)
- Empire metrics (health, article counts)
- Gentle check-ins at appropriate times

**You don't need to DO anything differently.** The agent works in the background. Just keep being you.

---

## Your New Daily Rhythm

### Morning (7 AM - 12 PM)

- **8:00 AM** — Daily note verification (silent). If yesterday's note is missing, you'll see a gentle nudge in #atlas: "Hey, we didn't log yesterday. Want to add a quick note?" Don't worry — this rarely happens now that memory sync is stable.

- **Anytime** — Your first work session. Income bot may have published an article overnight. You'll see a Discord notification if it failed; if it succeeded, it's silent (no alert needed).

- **If you're deep in conversation with me** — Working Buffer activates after context reaches 60%. This means we can talk for hours without losing earlier points. The buffer logs everything said in the "danger zone." You won't notice it until we need to recover.

### Afternoon (12 PM - 5 PM)

- **Every 30 minutes** — Empire health check (silent). Checks income bot last run, errors, article count. If something's wrong, you get a Discord alert immediately.

- **3:00 PM** (if configured) — Optional reflection prompt: "What did we learn today?" Only appears if you've made >3 decisions today. You can ignore it; it's just a nudge toward metacognition.

### Evening (6 PM - 10 PM)

- **6:00 PM** — Gentle check-in window opens. You might see: "Evening wrap-up! How's the empire building going? Need a break?" Click reactions or reply — or ignore, totally fine.

- **9:00 PM** — Self-care coordination. The wellness harmony script ensures proactive agent stays quiet if your self-care reminder is about to fire. No overlap.

- **10:00 PM** — All notifications stop. The agent goes silent until 7 AM.

### Night (10 PM - 7 AM)

- **Do not disturb** — The agent knows you sleep. Zero pings, zero check-ins. Working buffer continues logging if you're up late, but no outbound messages.

### Weekly (Sunday)

- **10:00 AM** — Weekly metrics summary arrives in #atlas. Format:

```
📊 Weekly Empire Report — Week of Feb 15

Articles published: 12 (↑3 vs last week)
Income bot uptime: 100% (168/168 hours)
Errors: 0
Health: ✅ STRONG

Milestone watch: 50 articles → first revenue expected
Next milestone: 100 articles (est. 6 weeks)

🎯 Suggested focus this week:
- Add 5 new supplement keywords
- Review Chewy affiliate application
- Update about page with personal story
```

Read it, celebrate progress, adjust focus. Takes 2 minutes.

### Monthly (1st of month)

- **9:00 AM** — Month-in-review. Larger reflection: "How is the empire progressing compared to 30 days ago?" Includes trend analysis and forward-looking recommendations.

---

## WAL Protocol in Practice

### The Rule (Spencer-Specific)

> When Spencer says something from the **WAL triggers list**, write it to `SESSION-STATE.md` **BEFORE** composing your response.

### Triggers (What to Capture)

| Category | Examples | Where in SESSION-STATE.md |
|----------|----------|---------------------------|
| Decisions | "Use Gemini 2.0", "Switch to Hugo", "Pause income bot" | `## DECISIONS` |
| Preferences | "I like dark theme", "Don't check weekends", "Gentle tone" | `## PREFERENCES` |
| Metrics | "We're at 47 articles", "Earned $50", "Traffic up 20%" | `## EMPIRE METRICS` |
| Corrections | "It's German Shepherd, not Shepard" | `## CORRECTIONS` |
| Names/Places | "Dr. Smith", "Chewy affiliate contact: John" | `## NAMES & CONTACTS` |
| Medical Context | "Feeling dizzy today", "Appointment rescheduled" | `## MEDICAL CONTEXT` |

### How It Works (Step-by-Step)

1. Spencer says: "Actually, the niche should be 'hip supplements for German Shepherds' not just 'dog supplements'."

2. I (Atlas) internally: **STOP**. Do not start crafting reply yet.

3. I open `SESSION-STATE.md`, find or create `## DECISIONS` section.

4. I append: `- [2026-02-19 00:15] Niche refinement: hip supplements for German Shepherds (breed-specific)`

5. I **then** respond to Spencer: "Got it. German Shepherd hip supplements — that's a great micro-niche. More specific = less competition."

### Why This Order?

Because if context overflows right after this exchange, the decision is safely in WAL. Without WAL, that crucial pivot would be lost and we'd re-discuss it later. WAL ensures **no decision ever slips**.

### Common WAL Opportunities (Watch for These)

- Spencer says "I like that" or "That's a good idea" → capture preference
- Spencer mentions a number → capture metric
- Spencer says "change X to Y" → capture decision
- Spencer corrects a fact → capture correction
- Spencer mentions a person/company/product → capture name

---

## When Context Overflows

### Symptoms

- You see "context overflow" error in logs
- I seem to "forget" something we discussed 20 minutes ago
- The session restarts automatically

### What Happens Automatically

1. **Working Buffer** has been logging our last ~20 messages since context hit 60%. It's stored in `memory/working-buffer.md`.

2. **Compaction Recovery** kicks in on session restart:
   - Reads working buffer
   - Reads `SESSION-STATE.md` (WAL)
   - Reads yesterday's daily note
   - Extracts key context
   - Restores state

3. **I come back online** and say: "Recovered from context loss. Last we were working on [income bot niche selection]. Should we continue?"

### Your Action

**None.** It just works. You might see the "recovered" message once and then we pick up where we left off.

### Manual Recovery (Rarely Needed)

If something goes wrong and I seem lost:

```powershell
cd C:\Users\spenc\.openclaw\workspace\skills\spencer-proactive-agent
.\scripts\recover-context.ps1 -Force
```

Then tell me: "I ran recovery. The last thing was [X]." And we'll sync.

---

## Empire Building with the Proactive Agent

### The Income Bot Synergy

The proactive agent doesn't replace your income bot — it **supervises** it.

| Income Bot Does | Proactive Agent Does |
|-----------------|---------------------|
| Generate & publish articles | Monitor health, alert on failures |
| Track revenue (once live) | Compile weekly metrics |
| SEO optimization | Track content count, milestone celebrations |
| Affiliate link insertion | Report progress toward revenue goals |

### Health Dashboard (Mental Model)

Every 30 minutes, the agent checks:

```
✅ Last run: < 2 hours ago?
✅ Exit code: 0?
✅ Articles added since last run: > 0?
✅ Errors in log: 0?

If all yes → status HEALTHY → silent
If any no → status UNHEALTHY → alert to #atlas
```

You get an alert only when something's wrong. No noise.

### Metrics That Matter

The agent tracks (via `empire-metrics.ps1`):

- **Articles published** — cumulative count
- **Days since last article** — should be 0-1
- **Income bot uptime** — % of scheduled runs that succeeded
- **Error rate** — errors in last 24h
- **Next milestone** — based on article count (10, 50, 100)

These are written to `memory/topics/empire-metrics.md` and included in weekly summaries.

### Milestone Celebrations

When you hit:
- **10 articles** → "🎉 First milestone! 10 down, 90 to first revenue milestone."
- **50 articles** → "🔥 Halfway to 100! Traffic should be starting to trickle in."
- **100 articles** → "💰 100 articles live — first revenue very likely within 30 days."
- **First $100** → "💸 FIRST REVENUE! Empire-building is now self-sustaining."

These appear as Discord messages in #atlas.

---

## Maintenance Tasks

### Daily (You don't need to do anything — automated)

- Memory sync runs every 10 min (already working)
- Empire health checks every 30 min
- Working buffer monitoring every 5 min

### Weekly (10 minutes)

- Read the weekly metrics summary (Sunday 10 AM)
- Note any trends: articles slowing? errors increasing?
- Adjust focus if needed (agent will suggest actions)

### Monthly (15 minutes)

- Read month-in-review (1st 9 AM)
- Update `config.yaml` niche keywords if pivoting
- Check `task-audit.log` for any repeated errors (optional)

### As Needed

- **Add new cron job?** Edit `scheduling/cron-jobs.json` then run `install-cron.ps1`
- **Remove a check-in?** `openclaw cron remove --label <label>`
- **Tune thresholds?** Edit `CONFIGURATION.md` (e.g., change `ThresholdPercent` from 60 to 70)

---

## Troubleshooting Scenarios

### "I'm getting spammed with alerts!"

**Cause:** Income bot failing repeatedly, or cron job misconfigured.

**Fix:**
1. Check `memory/topics/empire-metrics.md` to see what's failing
2. If income bot genuinely broken, fix that first — alerts will stop when health returns
3. If it's a false positive, edit `scripts\empire-metrics.ps1` to tighten conditions
4. Temporarily disable: `openclaw cron remove --label proactive-empire-health`

### "The agent forgot [X] we talked about."

**Likely:** WAL wasn't triggered (you didn't explicitly state it) or context overflow before capture.

**Fix:**
1. Manually add to `SESSION-STATE.md`: `- [2026-02-19] [X]`
2. Or ask me to capture: "Write to WAL: [X]"
3. If it's critical, run `.\scripts\recover-context.ps1` to rebuild from buffer

### "Check-in came at 11 PM — that's past my sleep time!"

**Bug:** The time check in `proactive-checkin.ps1` might be off.

**Fix:** Edit that script, ensure `$hour -ge 22` block exits 0. Then report to me (#atlas) so we can patch.

### "Empire health check says 'No health status file found' but income bot is running."

**Cause:** Income bot hasn't created `status.json` yet (maybe first run hasn't completed).

**Fix:** Wait for income bot to complete one cycle (it should create the file). Or manually create empty status file to silence alert (then agent will work when bot starts writing).

### "Working buffer file is huge — should I delete it?"

**No!** The buffer rotates automatically at midnight. Old ones are archived in `memory/buffer-archive/`. If you want to reclaim space, delete old archives there. Keep the current `working-buffer.md` — it's your safety net.

### "I want to turn off just the weekly metrics summary."

**Fix:** Remove the job: `openclaw cron remove --label proactive-weekly-metrics`

---

## Customization Guide

### Change Check-in Times

Edit `scripts/proactive-checkin.ps1`:
- Line where `$TimeOfDay` is set — modify the hour ranges
- Or change the cron schedule in `scheduling/cron-jobs.json`

### Adjust Context Threshold

Default is 60% for working buffer activation. To change:

Edit `scripts/working-buffer.ps1` and modify `$ThresholdPercent` parameter value.

### Add New Empire Metrics

Edit `scripts/empire-metrics.ps1`:
- Add new data sources (read files, query APIs)
- Add new report fields in the `$report` template

### Modify Alert Channels

By default, all alerts go to #atlas. To add #error-logs for technical issues:

1. In `integrations/discord.ps1`, modify `$Channel` default or pass `-Channel error-logs`
2. In `scripts/empire-metrics.ps1`, change the call: `.\integrations\discord.ps1 -Level error -Channel error-logs`

### Tune WAL Triggers

WAL is implemented in the main agent, not this skill. To adjust what gets captured:

- Edit the main agent's prompt to include WAL instructions (check AGENTS.md)
- Or modify `WAL-ENHANCEMENT.md` examples and copy to your agent's behavior guidelines

---

## When to Escalate to Atlas

If something breaks repeatedly, or you want to adjust the agent's fundamental behavior, talk to me (#atlas). I can:

- Rewrite script logic
- Add new cron jobs
- Tune thresholds
- Integrate with new data sources
- Debug persistent issues

---

## Appendix: File Reference

| File | Purpose | Edit Frequency |
|------|---------|----------------|
| `SESSION-STATE.md` | Active WAL log (auto-updated) | Never manually — let WAL do it |
| `memory/working-buffer.md` | Raw conversation snippets (auto-rotated) | Never — auto-managed |
| `memory/topics/empire-metrics.md` | Health reports (overwritten each run) | Read-only for you |
| `CONFIGURATION.md` | Global settings (thresholds, paths) | Rarely — initial setup |
| `cron-jobs.json` | Job list (install-cron reads this) | When adding/removing jobs |
| `HANDBOOK.md` | This document — keep updated | When behavior changes |

---

*Handbook v1.0 — Spencer-optimized. Last updated 2026-02-19.*
