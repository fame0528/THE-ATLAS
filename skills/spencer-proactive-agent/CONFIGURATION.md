# Spencer's Proactive Agent Configuration

## Core Settings (for OpenClaw agents.defaults)

```json
{
  "compaction": {
    "mode": "safeguard",
    "reserveTokensFloor": 20000
  },
  "contextPruning": {
    "mode": "cache-ttl",
    "ttl": "2h"
  },
  "memorySearch": {
    "enabled": true
  },
  "heartbeat": {
    "every": "10m"
  }
}
```

## WAL Protocol Thresholds

- **Context trigger:** Start WAL at 50% usage (not 60%) — gives Spencer more buffer
- **Danger zone:** 60-85% — Working Buffer active
- **Critical:** >85% — force compaction, recover from buffer

## Working Buffer Settings

- **Location:** `memory/working-buffer.md`
- **Rotation strategy:** Rotate daily at midnight, keep last 7 days
- **Compaction recovery:** Always read buffer first when "<summary>" detected

## Proactive Triggers for Spencer

### Empire Building Focus
- **Income Bot Health:** Check every 30 min. Alert if:
  - Last run > 2 hours ago
  - Errors in health log
  - Articles published count stalls
- **Metrics review:** Weekly Sunday 10 AM — compile empire stats
- **Milestone celebrations:** 10, 50, 100 articles; first $100 revenue

### Memory & Wellness
- **Daily note check:** Every morning 8 AM — verify yesterday's note exists
- **Memory sync health:** Every 10 min (ties to existing cron)
- **Self-care harmony:** Do not check between 10 PM - 7 AM

### Learning & Growth
- **Weekly reflection:** Friday 3 PM — "What did we learn this week?"
- **Monthly review:** 1st of month — "How's the empire progressing?"

## Cron Schedule (OpenClaw)

| Job | Schedule | Type | Description |
|-----|----------|------|-------------|
| working-buffer-monitor | Every 5 min | isolated agentTurn | Check context %, log to buffer if >60% |
| empire-health-check | Every 30 min | isolated agentTurn | Check income bot, memory sync, system status |
| daily-note-verification | Daily 8 AM | isolated agentTurn | Ensure yesterday's daily note exists |
| weekly-metrics-summary | Sunday 10 AM | isolated agentTurn | Compile and send weekly empire report |
| monthly-review | 1st of month 9 AM | isolated agentTurn | Month-in-review with forward look |
| buffer-cleanup | Daily midnight | isolated agentTurn | Rotate working buffer, archive old |
| outcome-journal-review | Weekly Sunday 9 AM | isolated agentTurn | Follow up on decisions >7 days old |

## Integration Points

- **Existing memory sync:** Existing `Sync-Memory.ps1` (every 10 min) — no changes needed
- **Discord alerts:** Use `income_bot/discord_notifier.py` pattern — create `integrations/discord.ps1`
- **Obsidian vault:** Working buffer should sync like any other memory file
- **Income Bot:** Read `income_bot/data/health/status.json` for metrics

## Security & Privacy

- **No external APIs** — all local execution
- **Working buffer redaction:** API keys automatically redacted before log
- **File permissions:** `memory/` directory only readable by user
- **Rate limiting:** Alerts max 1/hour same type to avoid spam

## Emergency Procedures

- **Force buffer rebuild:** `.\scripts\recover-context.ps1 -Force`
- **Disable proactive checks:** `openclaw cron remove --label "proactive-*"`
- **Reset WAL:** Delete `SESSION-STATE.md` (it will regenerate)
- **Full disable:** Remove skill from `agents.defaults.subagents.allowAgents`

---

*This configuration is Spencer-optimized. Do not use generic settings.*
