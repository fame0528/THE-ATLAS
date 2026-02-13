# Research Agent Skill

## Purpose
Find trending topics and business opportunities using Brave Search API. Posts formatted research to Discord channel `#research-agent`. Updates `content_factory` DB state.

## Triggers
- Manual run (via `/api/factory/research/run`)
- Schedule: every 6 hours (configurable)

## Flow
1. Query Brave Search for queries:
   - "trending technology business opportunities 2026"
   - "latest AI startup ideas"
   - "emerging markets news"
   - (can be customized via config)
2. For each query, fetch top 5 results
3. Deduplicate and rank by relevance/recency
4. Select top 3 stories
5. For each story, format:
   ```
   **Title**: ...
   **URL**: ...
   **Summary**: 2-sentence TL;DR highlighting business potential.
   ```
6. Post as a single embed or message to Discord channel `#research-agent`
7. Update DB: `content_factory` row with `agent='research'`, `status='success'`, `last_output_preview=JSON.stringify(selectedStories)`, `last_run_at=CURRENT_TIMESTAMP`

## Error Handling
- If Brave API fails, retry once; if still fails, set status='error', error_message=..., and continue
- If Discord post fails, log but still update DB with status='partial'

## Configuration
- BRAVE_API_KEY: from OpenClaw config
- DISCORD_CHANNEL_ID: hardcoded to private server channel `#research-agent` (need to create)
- Model for summarization: same LLM as brief (optional), but we can just use basic extraction.

## Output Format (Discord)
Post content:

🛰️ **Research Agent Output** — ${date}

**Top Story**: [title](url)
${summary}

**Secondary**: [title](url)
${summary}

**Tertiary**: [title](url)
${summary}

---

*Automated by Atlas • ${timestamp}*

## API Routes
- POST `/api/factory/research/run` — triggers immediate run, returns status
- GET `/api/factory/research/latest` — returns last result from DB

## DB Schema
Uses `content_factory` table with columns:
- `agent` TEXT ('research')
- `status` TEXT ('idle'|'running'|'success'|'error')
- `last_run_at` DATETIME
- `last_output_preview` TEXT (JSON string of stories)
- `error_message` TEXT (nullable)
