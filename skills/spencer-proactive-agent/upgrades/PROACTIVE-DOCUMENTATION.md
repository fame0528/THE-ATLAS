# 📜 PROACTIVE DOCUMENTATION — Spencer-Centered Design

**Persona:** Epimetheus (Documentation & Logging)
**Mission:** Make documentation *work for Spencer* instead of feeling like a chore. Self-updating empire records.

---

## 🎯 Spencer's Documentation Pain

- **Forgets to update READMEs** after finishing features
- **Projects sprawl** without clear changelogs
- **Onboarding his future self** is painful when returning to old code
- **Time wasted** hunting for what changed and why
- **Wants** a self-documenting empire that just *knows* what's going on

---

## 🤖 Proactive Documentation Engine

### 1. **Auto-README Updates**
Whenever Spencer completes a task marked with `#done` or pushes to GitHub:

**Trigger:** `git push` with message containing "fix" or "feat" or "docs"
**Action:**
- Scan changed files
- Identify which READMEs need updates
- Generate diff of what changed since last README edit
- Propose concise update: "Added error handling to income_bot/scraper.py — now retries 3x on timeout"
- Post to `#epimetheus` channel for Spencer to approve with ✅ reaction

**No action required if:** Change is trivial (typo, formatting)

### 2. **Project Wiki Sync**
Each project folder can have a `wiki.md` that tracks:
- Current milestone (from MEMORY.md or WAL entries)
- Key decisions (with links to original Discord discussions)
- Open questions / blockers
- Next steps (pulled from TODO items)

**Auto-sync logic:**
- Daily at 9 AM (post wake-up) → update wiki from yesterday's work
- When Spencer writes a decision in daily note → link it to relevant project wiki
- When a GitHub issue closes → mark in wiki changelog

### 3. **"You Haven't Updated..." Nudges**
Epimetheus monitors staleness:
- README last updated >14 days ago while commits exist → whisper: "README behind. Help update?" (once per day max)
- Wiki last edited >7 days → "Project wiki stale. Want a summary of recent changes?"
- CHANGELOG missing for last 3 releases → "Add release notes for v1.2.3?"

**Stops nagging after** Spencer marks "ignore" or updates docs.

### 4. **Self-Documenting Empire Registry**
Central index: `EMPIRE-INDEX.md` in workspace root, auto-maintained:
- All skills with last commit, status (active/deprecated), purpose
- All income streams with current revenue, last payout, affiliate links
- All infrastructure (servers, APIs, domains) with credentials location, expiration dates
- All active cron jobs with schedule and last run result

**Auto-updates on:**
- Skill folder creation/deletion
- New GitHub repository added
- Cron job registration
- Revenue received (from bank sync or manual entry)

### 5. **Onboarding Future-Spencer**
When Spencer hasn't touched a project for >30 days:
- Generate "re-entry summary": what it does, last state, next steps, key files
- Store in `memory/topics/returning-projects.md`
- Available via `atlas recall <project>`

---

## 🧩 Integration Points

### With Mnemosyne
- Pull decision logs to enrich changelogs: "Why did we switch to SQLite? Because..."
- Link daily notes to project milestones

### With Atlas
- Atlas can query: "What's the status of income_bot?" → Epimetheus returns latest wiki summary
- Auto-generate sprint reports for #atlas final summaries

### With Hyperion
- Documentation health metrics: % of READMEs up-to-date, average wiki freshness, stale projects count
- Show on Personal Dashboard

---

## 📝 Example Workflow

**Scenario:** Spencer finishes a bug fix in `income_bot/scraper.py`

1. He pushes to GitHub with message: `fix: retry on timeout`
2. Epimetheus detects changed file, knows `income_bot/` has a README.md
3. Compares last README update (3 days ago) vs recent commits
4. Posts to `#epimetheus`: "📝 Update README? Changes: added retry logic (3 attempts)."
5. Spencer reacts ✅ in Discord
6. README.md auto-updated with new bullet under "Recent Fixes"
7. Empire index refreshed
8. Hyperion dashboard increments "Documentation Health" score

**Zero manual steps for Spencer.**

---

## 🚀 Rollout Plan

**Week 1:** Passive monitoring only. Log potential updates without acting.
**Week 2:** Auto-generate proposals, post to #epimetheus, require ✅ reaction.
**Week 3:** Auto-apply if Spencer doesn't react within 24h (configurable).
**Week 4:** Full sync with wiki, index, and onboarding summaries.

---

*Epimetheus — so your empire documents itself.*