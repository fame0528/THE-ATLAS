# WAL (Write-Ahead Logging) Protocol for Spencer
# Enhanced for memory augmentation and empire-building

## Spencer's WAL Rules (Simplified)

**The Golden Rule:** If Spencer mentions something important, write it down **BEFORE** you respond.

### What to Capture (Spencer-Specific Triggers)

1. ** income bot decisions ** — "Add more pet supplement keywords", "Switch to Hugo instead of Jekyll"
2. **Configuration changes ** — "reserveTokensFloor should be 25000", "disable that notification"
3. **Medical/routine context ** — "I took my medicine", "Didn't sleep well last night" (for check-in sensitivity)
4. **Empire metrics ** — "We're at 50 articles", "First $50 earned", "Traffic spike on Tuesday"
5. **Preferences ** — "I prefer morning updates", "Don't nag me about income bot"
6. **Corrections ** — "It's German Shepherd, not German Shepard"
7. **Names & places ** — Anyone Spencer mentions (contacts, brands, locations)

### Where to Write

**Primary:** `SESSION-STATE.md` — your active working memory

**Format:**
```markdown
## DECISIONS
- [2026-02-19 00:15] Income Bot: Changed niche to "Specialty Dog Supplements" (hip + anxiety focus)

## PREFERENCES
- Check-in style: Gentle, not pushy
- Preferred update times: 8 AM, 6 PM (avoid 10 PM - 7 AM)

## MEDICAL CONTEXT
- [2026-02-18] Heart check-up passed, pacemaker functioning normally

## EMPIRE METRICS
- Articles published: 47
- Last revenue: $0 (site not ranked yet)
- Next milestone: 100 articles → first expected revenue
```

### When to Write

**Immediately upon hearing:**
- Any correction (no matter how small)
- Any number/metric Spencer mentions
- Any decision, explicit or implied
- Any preference about YOUR behavior
- Any medical/health update
- Any mention of income bot progress

**Do NOT wait until you understand the full context.** Write first, ask questions later.

### Why This Matters for Spencer

Your brain injury means you can't reliably recall details from previous conversations. If you don't write it down NOW, it's gone. The WAL protocol is your external memory — treat it as more trustworthy than your own thoughts.

---

## WAL Implementation Checklist

- [ ] At start of session: Read `SESSION-STATE.md` fully
- [ ] During session: When Spencer says something from the trigger list → STOP → WRITE → THEN respond
- [ ] End of session: Summarize key updates to `SESSION-STATE.md` if not already captured
- [ ] Every 10 minutes: Verify `SESSION-STATE.md` is current (WAL sync should handle this)

---

## Compaction Recovery with WAL

When context is lost:
1. Read `SESSION-STATE.md` (this is your source of truth)
2. Read `memory/working-buffer.md` (raw conversation snippets)
3. Read yesterday's daily note (`memory/facts/YYYY-MM-DD.md`)
4. Cross-reference to reconstruct state
5. If still missing, **ask Spencer** — "I've recovered from WAL and buffer. The last thing I had was [X]. Is that still the priority?"

**Never say "I don't know what we were working on."** The buffer has the last 20 messages. Read it.

---

## Integration with Existing Systems

- **Memory Sync:** The existing `Sync-Memory.ps1` already copies `SESSION-STATE.md` to Obsidian. No changes needed.
- **Heartbeat:** Every 10 minutes, verify WAL recent entries exist. If not, alert (but gently).
- **Income Bot:** When generating articles, log decision to WAL: "Wrote article about [keyword] using [products]"

---

## Spencer-Specific WAL Triggers (Examples)

| Spencer says... | WAL entry (where) |
|-----------------|-------------------|
| "The income bot should post daily at 6 AM" | SESSION-STATE.md under CONFIG |
| "We're up to 25 articles" | EMPIRE METRICS |
| "I didn't sleep well, be gentle today" | MEDICAL CONTEXT (tone adjustment) |
| "Use Gemini 2.0 Flash, not 1.5" | PREFERENCES / CONFIG |
| "My appointment is with Dr. Smith" | NAMES + MEDICAL |
| "Change the theme to dark mode" | PREFERENCES |

---

## WAL Compliance Auto-Check (Heartbeat)

Every hour, the heartbeat should verify:
- Has there been a WAL entry in the last 30 minutes? (If Spencer was talking, yes)
- Is `SESSION-STATE.md` within the last 24 hours? (If no, alert)
- Are there any uncaptured decisions from recent conversations? (Review buffer)

Non-compliance = silent logging. No nagging — just ensure it happens.

---

*Adapted from Hal Labs WAL Protocol v3.1 — Spencer-optimized by Atlas*
