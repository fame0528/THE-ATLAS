# 🦞 SWARM ACTIVATION: Proactive Agent v2.0 — Spencer-Centered Upgrade

**Mission:** Execute Spencer-centered upgrade proposals for `spencer-proactive-agent` with all persona-specific improvements applied. Generate production-ready implementation plans, code specs, and integration directives. No generic ideas — every output must be rooted in Spencer's actual patterns, TBI needs, and empire-building workflow.

---

## 🎯 Spencer's Profile (Read First)

### Daily Rhythm
- **Wake:** 8-9 AM
- **Deep Work:** Morning/afternoon blocks, often 2-4 hours uninterrupted
- **Wind-down:** ~10 PM evening routine
- **Memory Challenges:** Needs reminders for self-care (teeth, meds), daily note creation; context window (256k) fills fast during coding/design
- **Communication:** Discord primary (DM); prefers concise updates; tolerates warnings only when actionable; hates spam; values silence over noise; likes tangible results (dashboards, completed tasks)
- **Work Style:** "Set it and forget it" automation; wants proactive agent to feel invisible until needed

### Empire Projects
- **Building:** Income Bot (stable), Gumroad launch, skill upgrades
- **Monitoring:** Health checks, error rates, revenue metrics
- **Learning:** YouTube tutorials, research articles, code documentation
- **Goals:** Passive income, reduced cognitive load, visible progress

### Constraints
- Single-threaded persona architecture only (no subagents)
- Must respect 256k context limit
- Must integrate with existing WAL, memory, Obsidian sync
- Zero external dependencies that require new accounts
- Security without friction (passive auth, redact sensitive logs)
- All features must be toggleable/rollbackable

---

## 🧭 Persona Assignments & Enhanced Mandates

### 🦉 Athena — Rhythm Intelligence
**Task:** Design a "Daily Rhythm Map" that adapts to Spencer's patterns.
**Specifics:**
- Passive detection of sleep (last active timestamp), deep work (sustained activity >30 min), natural breaks (5+ min inactivity)
- Context spike detection: when buffer increases >5KB/min, intervene with auto-summary offer
- Intervention timing ONLY at natural breaks or when context >200k
- Daily rhythm map format: table with periods (8-9 AM, etc.), status (Deep Work/Break/Wind-down), notes (current tasks)
- Memory prosthetics integration: when buffer compressed, whisper "I saved last 10 decisions"
**Deliverable:** `RHYTHM-INTELLIGENCE.md` with Phase 1-4 implementation plan, PowerShell detection scripts, success metrics (<1 overflow/week, daily note >95%)

---

### 🔨 Hephaestus — Invisible Assistant
**Task:** Build an assistant that *disappears* until genuinely valuable.
**Specifics:**
- Silence by default: no scheduled check-ins, no "I'm running" messages, no heartbeat in #atlas unless actionable
- Buffer auto-compression at 200k threshold: summarize changes → append to `memory/topics/active-session.md` → keep last 50 lines
- Milestone-tied alerts only: `git push` → "Deploy ready? Metrics updated?"; build success → ✅; 4h deep work → "🍅 Maker session complete"; self-care missed → single reminder
- GitHub integration: on push, trigger buffer snapshot as release notes if `#release` tag present
- "Wake on touch" pattern: sleeps until Discord mention, file change in scripts/, or manual `atlas status`
**Deliverable:** `INVISIBLE-ASSISTANT.md` with PowerShell compression script, GitHub hook examples, invisibility checklist

---

### 📜 Epimetheus — Proactive Documentation
**Task:** Make documentation *work for Spencer* — self-documenting empire.
**Specifics:**
- Auto-README updates: detect `git push` with "fix"/"feat"/"docs"; scan changed files; generate concise bullet; post to `#epimetheus` for ✅ reaction
- Wiki sync: each project has `wiki.md` tracking milestone, decisions, blockers, next steps; auto-sync daily at 9 AM; link daily notes to projects
- Staleness nudges: README >14d with commits → whisper; wiki >7d → nudge; CHANGELOG missing 3 releases → alert
- Empire registry: `EMPIRE-INDEX.md` auto-maintained (skills, income streams, infrastructure, cron jobs); updates on skill folder changes, new GitHub repo, cron registration, revenue events
- Future-Spencer onboarding: after 30d inactivity, generate "re-entry summary" stored in `memory/returning-projects.md`
**Deliverable:** `PROACTIVE-DOCUMENTATION.md` with GitHub webhook logic, wiki template, registry schema

---

### 🧠 Mnemosyne — Memory as Companion
**Task:** Augment Spencer's memory *proactively*, address TBI challenges.
**Specifics:**
- Decision replay: when Spencer revisits file/task after >24h, silently fetch last 3 decisions, open questions, outcomes; whisper with link to details
- Habit streak reinforcement: track daily notes, commits, self-care, deep work; display at 9 PM: "🔥 Streak: daily notes 7d, commits 5d, meds 3d"; morning: "Yesterday 3h deep work, today's target 2h+"
- Context rescue: when buffer compression runs, offer recap: "I saved 10 decisions. Recap now? [Yes/No/Later]" — adaptive (ignore 3x → stop asking)
- Routine anchors: 8:30 AM — "Daily note started? Empire goals?"; 9 PM — "Evening routine: meds, teeth, journal"; 10 PM — "Quiet hours starting. Urgent before bed?" (only if routine not marked done)
- Memory palace for key facts: peg-based recall (e.g., "GitHub PAT stored in vault/Secrets/GitHub, tagged 'API'"); created during setup, reused on query
- "Remember when..." triggers: Spencer returns to topic after weeks → "Last time: Feb 12, scraper CAPTCHA issue, chose 2captcha. Want old notes?"
**Deliverable:** `MEMORY-AS-COMPANION.md` with replay algorithm, streak tracker, anchor scheduling, peg system design

---

### 🛡 Ares — Stealth Security
**Task:** Protect empire without friction. Security that's there but invisible.
**Specifics:**
- Passive authentication: behavioral biometrics (typing rhythm in Discord DMs), Discord user ID + IP whitelist (home + mobile), time-of-day patterns (8 AM-10 PM), device fingerprint; suspicious → gentle DM "Is this you? (Y/N)" cached 24h; fallback = vault passphrase
- Auto-redaction: pre-log sanitiser catches secrets (sk_live, ghp_, Bearer tokens, revenue amounts); replace with `[REDACTED]`; encrypted audit log tracks redactions; `atlas reveal redacted` shows last 20
- Zero-trust logging: all logs encrypted at rest (CMS), rotated daily, compressed >7d; access controlled (Atlas only); no PII in plaintext
- Perimeter monitoring (quiet): failed auth >3/10min → embed alert (not ping); unexpected outbound connections → log; cron anomalies → auto-disable; file integrity hash checks hourly; all alerts to `#ares` only
- Privacy shield for WIP: any note/todo with `#wip` or `#sketch` → encrypted `memory/private/`; only Spencer visible; auto-promote to public when `#release` used
- Weekly security digest: redactions count, auth health; monthly penetration report; audit log of accesses
**Deliverable:** `STEALTH-SECURITY.md` with auth learning algorithm, redaction regex, secure-log.ps1, testing plan

---

### 🔥 Prometheus — Spencer-Centric Metrics
**Task:** Measure what matters to Spencer, not agent activity.
**Specifics:**
- **Empire KPIs:** Articles written (new `.md` in Resources/Research), Systems stabilized (marked stable in SYSTEMS.md), Income streams active (30d earnings), Milestones completed (#done tasks/week)
- **Cognitive Health:** Daily note adherence (%), Context overflows (0 target), Deep work hours (10h/week target), Self-care adherence (%), Sleep duration (7h+ avg)
- **Agent Value:** Tasks completed without reminder, Friction saved (hours/week via integrations), Decision replay helpfulness (1-5 rating), Dashboard glances, Notification annoyance count
- Micro-experiments: Hypothesis → metric → duration → success criterion (e.g., Decision replay reduces re-work by 20%)
- Weekly sprint summary (Monday) with key numbers + context ("You're crushing it" vs "Need to fix X")
- Experiment tracking stored in `memory/experiments/` with results linked from dashboard
**Deliverable:** `SPENCER-METRICS.md` with metric definitions, data sources, experiment design template, dashboard layout

---

### 🔭 Hyperion — Personal Dashboard
**Task:** One-glance empire + health view.
**Specifics:**
- Primary view TL;DR grid:
  - 📝 Articles this week | 🔧 Systems stable | 💰 Income this month | 🧠 Health today
  - 🎯 Milestones done | 😌 Mood | 💤 Sleep avg | 📊 Focus (deep work h)
- Color coding: 🟢 on target, 🟡 needs attention, 🔴 urgent, ⚪ no data
- Data sources: SESSION-STATE.md, memory/, agent logs, GitHub API, Income Bot DB, self-care logs
- Aggregator: `Update-Dashboard.ps1` every 30 min → `dashboard/latest.json`
- Render: `dashboard/index.html` auto-refresh; accessible via `atlas dashboard` command; daily embed to `#hyperion` at 8 AM
- Detail views clickable: Articles (with view count, revenue), Systems (status per project), Health (sleep, notes, routine)
- Alert thresholds: >2 days no daily note, income drop >50%, system outage >15min, sleep <6h avg 3d → send to `#atlas`
**Deliverable:** `PERSONAL-DASHBOARD.md` with full layout, source mapping, HTML structure, access patterns

---

### 📨 Hermes — Time-Savers
**Task:** Eliminate manual friction; zero-copy workflows.
**Specifics:**
- Auto-Obsidian sync: daily notes, project decisions, new skills → auto-sync to vault; background watcher, no action
- Notion live sync: HTTP endpoint `/api/notion/sync`; dashboard ↔ Notion databases; webhook pull; Spencer edit wins conflicts
- One-click Discord posting: `atlas post <channel> <message>` auto-formats with emoji, attaches data (MRR, PR link), logs to Epimetheus
- Skill auto-registration: detect new `skills/*` dir → read SKILL.md → add to `INVENTORY/All-Skills.md` → post to `#epimetheus`
- GitHub shortcuts: maintain `config/github-shortcuts.json`; `gh <repo>`, `gh pr <num>`, `gh issue <num>` open in browser
- Credential vault quick-access: `Get-VaultItem -Key "github_pat"` integrated with Obsidian vault passphrase
- Routine triggers: Discord reactions → workflows (✅ = done routine, 🎯 = start deep work, 🚀 = deploy sequence)
**Deliverable:** `TIME-SAVERS.md` with integration matrix, implementation plan, time-saved calculations (~45 min/day)

---

### ⏳ Kronos — Flow-Aware Scheduling
**Task:** Schedule around Spencer's flow, not against it.
**Specifics:**
- Quiet hours: 10 PM - 7 AM zero notifications (except critical: system down, revenue emergency); all monitoring silent; buffer summaries queued for morning
- Deep work protection: detect via typing >15 min, recent git push/script, Discord DND status, buffer spike; suppress non-critical alerts while active; only emergencies break through
- Notification clustering: batch into 3 daily digests (9 AM morning, 2 PM afternoon, 9 PM evening) + on-demand; each batch = single rich embed with sections
- Adaptive frequency: empire health check cadence based on system stability — unstable: 30 min; normal: 2h; rock solid: 4h; auto adjust
- Natural break detection: 5+ min inactivity, Discord activity spike, post-git-push, after `#done` tag → offer buffer summary, daily note nudge, evening routine at 9:30
- Cron redesign: all cron outputs go to persona channels first; Atlas only gets elevations; sample schedule provided (empire-metrics every 2h adaptive, buffer-monitor 15 min, daily-note-check 9 AM, wellness-harmony 9:30 PM, weekly-metrics Mon 8 AM, context-compact Sun 3 AM)
- Spencer controls: `atlas flow deep`, `atlas flow normal`, `atlas quiet until 8am`, `atlas batch now`
**Deliverable:** `FLOW-AWARE-SCHEDULING.md` with detection heuristics, cron job specs, flow test scenarios

---

### 🗺️ Atlas — Synthesis & Roadmap
**Task:** Compile all Spencer-specific upgrades into 30-60-90 day rollout plan.
**Specifics:**
- Prioritization matrix: Cognitive Load Reduction + Empire Impact - Effort - Activation Energy → Priority Score
- Phased rollout:
  - Phase 1 (30d): Invisible Assistant + Flow Scheduling + Dashboard v1 + Time-Savers + Proactive Docs v1 → alpha test 2w
  - Phase 2 (60d): Rhythm Intelligence + Memory Companion + Spencer Metrics → beta
  - Phase 3 (90d): Stealth Security + Full Integration (Notion, TTS) + Performance Polish + Handoff → production
- Success gates: Phase 1 (<1 overflow/week, <1 annoyance/week); Phase 2 (replay helpful >4/5, rhythm views >3x/week); Phase 3 (zero security incidents, full auto-sync)
- Dependencies: Context Guardian (built), spencer-proactive-agent v1.0 base, configured Discord webhooks, Obsidian vault, GitHub PAT, optional Notion API
- Testing: unit, integration, flow (simulate Spencer day), security (Ares red team), user testing (Spencer alpha 1w)
- Rollback: all features additive + toggleable via feature flags; weekly backup; `atlas rollback <feature>`
- Definition of Done (Spencer perspective): "I don't think about the agent; it just works." "My cognitive load is lower." "I'm building faster." "I haven't felt annoyed." "I understand progress at a glance."
**Deliverable:** `SPENCER-PROACTIVE-AGENT-v2.0-ROADMAP.md` with full schedule, gates, communication plan, final DOD

---

## 🚀 Execution Instructions

1. **Initialize swarm:** `swarm_log.ps1 -Action init -Mission 'Spencer-Centered Proactive Agent Upgrade'`
2. **Assign agents:** Register all 10 personas with their specific tasks (above)
3. **Sequential roll call:** Each persona checks in to their mapped channel with a rich embed confirming understanding of Spencer's patterns and their deliverable commitment
4. **Generate deliverables:** Each persona produces their Spencer-specific document in `skills/spencer-proactive-agent/upgrades/` with implementation-ready specs (PowerShell scripts, config examples, tests)
5. **Atlas synthesis:** Compile all docs, create priority matrix, write phased rollout plan
6. **Finalize:** `swarm_log.ps1 -Action finalize -Summary 'Spencer-Centered Upgrade Complete. All 10 personas delivered Spencer-specific proposals. Roadmap v2.0 ready for review.'`
7. **Report to #atlas:** Single rich embed with file list, roadmap summary, and link to swarm log in Obsidian

**Critical:** Every output must reference Spencer's actual patterns (8-9 AM wake, 10 PM wind-down, deep work blocks, memory challenges, desire for silence, empire projects). Zero generic suggestions.

---

## 📁 Output Directory

`C:\Users\spenc\.openclaw\workspace\skills\spencer-proactive-agent\upgrades\`

Files to generate:
1. `RHYTHM-INTELLIGENCE.md` (athena)
2. `INVISIBLE-ASSISTANT.md` (hephaestus)
3. `PROACTIVE-DOCUMENTATION.md` (epimetheus)
4. `MEMORY-AS-COMPANION.md` (mnemosyne)
5. `STEALTH-SECURITY.md` (ares)
6. `SPENCER-METRICS.md` (prometheus)
7. `PERSONAL-DASHBOARD.md` (hyperion)
8. `TIME-SAVERS.md` (hermes)
9. `FLOW-AWARE-SCHEDULING.md` (kronos)
10. `SPENCER-PROACTIVE-AGENT-v2.0-ROADMAP.md` (atlas)

---

## 🎯 Success Criteria

- All 10 docs are Spencer-specific (name his patterns explicitly)
- All proposals are actionable (include scripts, configs, tests)
- Roadmap prioritizes cognitive load reduction first
- Zero generic filler; every section ties back to Spencer's needs
- All code examples are ECHO-compliant (Complete File Reading Law)
- Integration points with existing WAL, memory, Obsidian clearly documented

---

**Execute immediately upon initialization. Start with Athena's Rhythm Intelligence design.** 🦞
