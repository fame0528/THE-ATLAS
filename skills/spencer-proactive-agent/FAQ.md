# FAQ — Spencer's Proactive Agent

## General

**Q: What is this proactive agent thing?**  
A: It's a background system that quietly monitors your work, captures important details you mention (so you don't forget), and gives you gentle nudges at sensible times. Think of it as an external memory + automated assistant rolled into one, built for your specific needs.

**Q: How is this different from you (Atlas)?**  
A: I'm still here — this agent runs *under* me as a skill. It's the automation layer that handles the repetitive monitoring tasks so I can focus on deep conversations and strategic help. It's like hiring a junior assistant to handle the busywork while I'm your partner.

---

## Memory & WAL

**Q: Do I really need to write everything to WAL?**  
A: Yes. Your brain injury means short-term details don't stick. If you don't capture them NOW, they're gone. WAL writes BEFORE I respond — it's the single most important feature for you. Think of it as an external hard drive for your memory.

**Q: What if I forget to write to WAL?**  
A: The working buffer catches everything said in long conversations. If context overflows, I run `recover-context.ps1` to pull details from the buffer and rebuild state. You don't have to do anything — it's automatic.

**Q: Can I review what's in WAL?**  
A: Yes — open `SESSION-STATE.md` anytime. It's plain text, synced to your Obsidian vault automatically every 10 minutes.

---

## Notifications & Check-ins

**Q: Will this spam me with notifications?**  
A: No. Design principles:
- No alerts between 10 PM - 7 AM (respects sleep)
- Empire health checks are silent unless something's wrong
- Proactive check-ins max 3/day (morning/afternoon/evening) and only if you're active
- All alerts go to #atlas (your home base) — you control when to look

**Q: I'm getting too many messages. How do I tone it down?**  
A: Run: `openclaw cron remove --label proactive-proactive-checkin` to stop check-ins entirely. Or edit `cron-jobs.json` to reduce frequency (e.g., change "every 5 min" to "every 30 min").

**Q: Can I customize what times I get check-ins?**  
A: Yes — edit `scripts\proactive-checkin.ps1` and adjust the time-of-day logic. Or modify the cron schedule in `scheduling\cron-jobs.json`.

---

## Income Bot Integration

**Q: I haven't set up the income bot yet. Will this break?**  
A: No. The health check will simply report "not installed" and the metrics file won't appear. That's fine. Once you activate income bot, the monitoring kicks in automatically.

**Q: The health check says 'unhealthy' but income bot seems fine.**  
A: The agent looks for `income_bot/data/health/status.json`. Make sure income bot has run at least once to create that file. If the file exists but status is false, check income bot's own logs for errors.

**Q: Can I add more metrics to track?**  
A: Yes — edit `scripts\empire-metrics.ps1` to include additional data sources (e.g., website traffic from Google Analytics API, revenue from affiliate dashboards). Keep it local-only; no cloud connections.

---

## Privacy & Security

**Q: Does this send my data anywhere?**  
A: No. All processing is local on your machine. The only external communication is via OpenClaw's Discord provider (which you already trust). No AI APIs, no agent networks, no telemetry.

**Q: Is the working buffer secure? Could it leak private info?**  
A: The buffer contains raw conversation snippets (what you and I say). It's stored in your workspace `memory/` directory, which is already private to your user account. Ares security audit confirmed no leakage risks. The buffer is **not** committed to git (`.gitignore` includes it).

**Q: What if I mention a password or API key accidentally?**  
A: There's a `sanitize-logs.ps1` script that redacts common secret patterns before writing. It's not fully reliable — best practice: never share credentials in chat. If you do, immediately rotate them.

---

## Performance & Resources

**Q: Will this slow down my system?**  
A: Negligible. The scripts are PowerShell, run for <1 second each time. The heaviest is `empire-metrics.ps1` at ~500ms when reading large logs. Running every 30 minutes is fine. Total CPU impact <0.1% on average.

**Q: Does this use a lot of disk space?**  
A: Working buffer rotates daily and archives old buffers. Each archive is ~50-200 KB depending on conversation volume. A month of archives is <10 MB. SESSION-STATE.md grows slowly — maybe 1-2 KB per day of decisions.

---

## Troubleshooting

**Q: I don't see any check-in messages.**  
A: It might be nighttime (the agent respects sleep hours). Or the cron job might not be installed. Run `openclaw cron list` and look for labels starting with `proactive-`. If missing, run `scheduling\install-cron.ps1`.

**Q: Memory sync isn't writing the files the agent creates.**  
A: Your existing `Sync-Memory.ps1` should copy everything from `memory/` to Obsidian. Verify it's running (cron job "Sync Memory"). If not, run it manually: `powershell -File C:\Users\spenc\.openclaw\workspace\scripts\Sync-Memory.ps1`.

**Q: The agent sent a weird or irrelevant message.**  
A: That's a bug — tell me (#atlas) and we'll tune the logic. The templates in `proactive-checkin.ps1` can be adjusted. The agent should never be spammy or off-topic.

**Q: Can I disable just one feature?**  
A: Yes — you can remove individual cron jobs without affecting others. Use `openclaw cron remove --id <job-id>` or label. See `scheduling\uninstall-cron.ps1` for patterns.

**Q: What if I want to completely remove this agent?**  
A: Run `scheduling\uninstall-cron.ps1` to stop all scheduled jobs. Then delete the `spencer-proactive-agent` folder. All data files (`memory/working-buffer.md`, `memory/topics/empire-metrics.md`) remain — you can delete those manually if desired. WAL entries in `SESSION-STATE.md` will stay but won't be used.

---

## Advanced

**Q: Can I use this with a different AI model or agent?**  
A: The skill is designed for OpenClaw with Step 3.5 Flash. It relies on OpenClaw's WAL and session management. Porting to other frameworks would require significant rework.

**Q: How do I extend it with my own scripts?**  
A: Add new `.ps1` files to the `scripts/` directory, then add corresponding cron jobs to `scheduling/cron-jobs.json`. Follow the pattern of existing scripts (param block, workspace default, output to `memory/`).

**Q: What's the difference between WAL and Working Buffer?**  
A: WAL = deliberate capture of important decisions (you tell me, I write). Working Buffer = automatic dump of everything said during long conversations when context gets full. WAL is curated; Buffer is raw backup. Both survive context loss.

**Q: Can I run this on Linux/macOS?**  
A: The scripts are PowerShell (Windows). With minor path changes (`/` vs `\`, `$env:USERPROFILE` vs `$HOME`), they could adapt. But Spencer is Windows, so no need.

---

## Still Stuck?

- Read **HANDBOOK.md** for deeper operational details
- Check **QUICKREF.txt** for command cheat sheet
- Ask **Atlas** in #atlas — I'm your partner, here to help

*Last updated: 2026-02-19*
