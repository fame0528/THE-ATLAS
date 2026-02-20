# 🔨 INVISIBLE ASSISTANT — Spencer-Centered Design

**Persona:** Hephaestus (Lead Developer, Full-Stack)
**Mission:** Build an assistant that *disappears* until it's genuinely valuable. Zero noise, maximum leverage.

---

## 🔍 Spencer's Pain Points

- **Context window fills fast** during coding/design → overflow crashes
- **Annoyed by constant pings** — wants "set it and forget it"
- **Only wants alerts** when tied to meaningful milestones (GitHub pushes, builds)
- **Hates feeling monitored** but needs safeguards
- **Wants visible progress** (dashboards, completed tasks) without daily check-ins

---

## 🕶️ Invisibility Principles

### 1. **Silence by Default**
- No scheduled "check-ins" ever
- No "how are you doing?" messages
- No heartbeat blips in #atlas unless something *actually* needs attention
- Buffer exists but never speaks unless:
  - Context window > 200k (auto-summary offer)
  - Build/deploy succeeds or fails
  - Empire revenue threshold crossed
  - Self-care routine missed (and only once per day)

### 2. **Smart Buffer Management**
Current problem: SESSION-STATE.md grows fast during coding sprints.

**Solutions:**
- **Auto-contraction:** When buffer exceeds 200k, silently:
  1. Summarize changes since last checkpoint
  2. Append to `memory/topics/active-session.md`
  3. Compress buffer to <100k, preserving last 50 decisions
- **GitHub-triggered cleanup:** On every push, compress and commit buffer changes as a "session snapshot"
- **Milestone tagging:** When Spencer runs `#release` or `#deploy`, freeze buffer as release notes

### 3. **Milestone-Tied Alerts**
Only interrupt when Spencer naturally completes something:

| Trigger | Alert |
|---------|-------|
| `git push` to main | "Deploy ready? Empire metrics updated." |
| Build succeeded | "✅ Pipeline green. Income Bot stable." |
| 4 hours deep work | "🍅 Maker session complete. Everything okay?" |
| Self-care not logged | "🩺 Meds/teeth not marked. Reminder once." |
| Revenue spike | "💰 $X earned. Nice work." |
| Context overflow risk | "🧠 Buffer 190k. Auto-summarize now?" |

**Never** interrupt for:
- Regular cron outputs (log to file instead)
- Background task completions (just update dashboard)
- Routine health checks (silent unless failing)

### 4. **Integration with Workflow**
- **GitHub Actions:** Post build status to dedicated channel, not Spencer's DM
- **Obsidian sync:** Auto-create daily notes from buffer summaries, but don't ping
- **Empire Dashboard:** Hyperion's dashboard is the *only* place Spencer needs to look for status
- **Discord:** Use reactions instead of messages when possible (✅ on build success)

### 5. **"Wake on Touch" Pattern**
The assistant sleeps until Spencer interacts:
- **Discord mention:** Wake and process request
- **File change in `scripts/` or `income_bot/`:** Wake and validate
- **Manual `atlas status`:** Wake and report
- Otherwise: background monitoring only, no pings

---

## 🛠️ Implementation Details

### Buffer Auto-Compression Script
```powershell
# skills/spencer-proactive-agent/scripts/Compress-Buffer.ps1
$sessionFile = "C:\Users\spenc\.openclaw\workspace\SESSION-STATE.md"
$summaryFile = "memory/topics/active-session.md"
$threshold = 200000 # bytes

if ((Get-Item $sessionFile).Length -gt $threshold) {
    $summary = Generate-Summary -From (Get-Content $sessionFile -Raw)
    Add-Content -Path $summaryFile -Value $summary
    # Keep last 50 lines, compress rest to summary
    $lastLines = Get-Content $sessionFile | Select-Object -Last 50
    Set-Content $sessionFile -Value ($lastLines -join "`n")
}
```

### Milestone Detection Hook
```powershell
# Hook into local-coding-assistant output
if ($Output -match "✅ COMPLETE" -or $gitMessage -match "deploy|release") {
    # Trigger milestone alert (only if Spencer is active)
    Send-MilestoneNotification -Message "Task complete. Empire grows."
}
```

---

## 📊 Visibility Without Noise

Spencer sees progress via:
1. **Hyperion's Dashboard:** One-glance view of everything
2. **Daily Note in Obsidian:** Auto-populated with decisions made
3. **GitHub Repository Activity:** Commits, issues, releases
4. **Monthly Sprint Summary:** Auto-generated, delivered to #atlas

He never sees:
- "I'm still running"
- "Background task finished"
- "Health check passed"
- "Cron job executed"

---

## ✅ Invisibility Checklist

- [ ] No proactive messages unless exception/threshold
- [ ] Buffer auto-compression runs silently
- [ ] GitHub hooks post to channels, not DMs
- [ ] All alerts have clear actionability (can be dismissed with one click)
- [ ] Spencer can configure "quiet hours" beyond 10 PM-7 AM
- [ ] All background activity logged to files, not chat

---

*Built by Hephaestus — the assistant that works so quietly, you'll forget it's there until you need it.*