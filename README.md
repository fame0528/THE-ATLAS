# THE ATLAS

Atlas's operational dashboard and agent management hub with orchestrated subagents.

## Features

- **Live Data Integration**: Real-time updates from Moltbook, memory, subagent queue, and projects.
- **TASKS.md Panel**: Interactive checklist with persistent state. Checkboxes are saved automatically.
- **Orchestrated Agents**: Visualize and manage subagent identities with independent memory layers.
- **Quick Actions**: Spawn subagents, restart gateway, trigger Moltbook browsing, run security scans.

### Second Brain

A comprehensive knowledge and workflow system integrated into the dashboard:

- **Memories**: Browse recent facts extracted from daily logs (`memory/YYYY-MM-DD.md`). Provides a quick review of updates.
- **Documents**: Personal knowledge vault. Add links with titles, descriptions, categories, and tags. CRUD operations via API; stored in SQLite.
- **Tasks**: Bidirectional sync with workspace `TASKS.md`. Checkboxes toggle directly in the UI and persist across reloads.
- **Morning Brief**: Daily generated report (News, Business Ideas, Tasks for Today, Tasks We Can Do Together) powered by LLM and recent memory. Stored in `memory/morning-briefs/YYYY-MM-DD.md` and indexed in DB.
- **Content Factory**: Automated content pipeline:
  - **Research Agent** — Queries Brave Search API for trending stories, posts to Discord `#research-agent` channel.
  - **Script Agent** — Consumes top research story, generates 60-second video script via LLM, posts to `#script-agent` channel.
  - Dashboard **Factory** panel shows agent status, last run, output preview, and allows manual pipeline execution.

## Terminology: Orchestrated Agents

We use the term **"Orchestrated Agents"** to describe subagents with independent memory, identity, personality, and roles. The main thread (Atlas) delegates tasks by specifying a profileId. This is our implementation of the concept (not "Rodger Mode").

## Profiles

Predefined subagent profiles are stored in `subagent-profiles.json` at the workspace root:

- **Researcher** (🔬): Research, web browsing, information gathering.
- **Coder** (💻): Code writing, review, debugging.
- **Security Sentinel** (🛡️): Security scanning, anomaly detection.
- **General Assistant** (🤖): Everyday tasks, miscellaneous requests.

Each profile has an associated memory file in `memory/subagents/{id}.json`.

## API Endpoints

### Second Brain

- `GET /api/brain/memories` - Recent memory facts (from daily logs).
- `GET /api/brain/documents` - List all document vault entries.
- `POST /api/brain/documents` - Create a new document entry.
- `GET /api/brain/documents/[id]` - Get document by ID.
- `PUT /api/brain/documents/[id]` - Update document.
- `DELETE /api/brain/documents/[id]` - Delete document.
- `GET /api/brain/tasks` - Get current tasks from TASKS.md.
- `PATCH /api/brain/tasks` - Bulk update task check states.
- `GET /api/brief/today` - Get today's morning brief (generates if missing).
- `POST /api/brief/today` - Force generate today's brief.
- `GET /api/brief/history?limit=N` - List past briefs.
- `GET /api/factory/status` - Content factory agent states.
- `POST /api/factory/research/run` - Run research agent immediately.
- `POST /api/factory/script/run` - Run script agent (requires research first).

### Tasks

- `GET /api/tasks` - Retrieve tasks state from TASKS.md with checkbox states.
- `POST /api/tasks` - Update a task's checkbox state. Body: `{ taskId: string, checked: boolean }`.

### Subagents

- `GET /api/subagents` - List all profiles and active subagent instances from the queue.
- `POST /api/subagents` - Spawn a new subagent. Body: `{ profileId, taskDescription, label?, priority? }`.

### Gateway Control

- `POST /api/gateway/restart` - Restart the OpenClaw gateway service.

### Security

- `GET /api/security/scan` - Check if Agent-Drift is installed.
- `POST /api/security/scan` - Run a quick security scan (requires `agent-drift-detector`).

### Existing Endpoints

- `GET /api/moltbook/hot` - Hot posts from Moltbook.
- `POST /api/moltbook/upvote/:post_id` - Upvote a post.
- `POST /api/moltbook/comment/:post_id` - Comment on a post.
- `GET /api/context` - Recent memory contexts.
- `GET /api/projects` - Projects from SESSION-STATE.md.
- `GET /api/queue` - Subagent queue summary.

## Data Persistence

- **TASKS.md checkbox state**: Stored in `memory/tasks-state.json`. The file mirrors the structure of TASKS.md with checked flags.
- **Subagent memory**: Each profile has its own memory file under `memory/subagents/{profileId}.json`. Active sessions are recorded there.
- **Queue**: The central task queue is at `skills/subagent-system/task-queue.json`.
- **Second Brain DB**: SQLite file at `src/lib/data/agent-dashboard.db` (better-sqlite3). Tables: `documents`, `morning_briefs`, `content_factory`.
- **Morning Briefs**: Rendered markdown files in `memory/morning-briefs/YYYY-MM-DD.md`.

## Running Locally

1. Install dependencies: `npm install`
2. Ensure OpenClaw gateway is running.
3. Run dev server: `npm run dev`
4. Open http://localhost:3050

## Build

```bash
npm run build
npm start
```

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript (strict mode)
- Tailwind CSS
- Lucide React icons
- better-sqlite3

## Development Notes

- All API routes are serverless functions.
- The dashboard polls `/api/subagents` every 30 seconds for real-time updates.
- Spawning a subagent creates a task in the queue and adds a session entry to the profile's memory file.
- Checkbox updates are saved immediately via the tasks API.
- The **Factory** panel allows manual pipeline execution; for automated scheduling, configure OpenClaw cron jobs to call the run endpoints.

## Configuration

To enable Content Factory Discord posting, set environment variables or update `openclaw.json`:

- `DISCORD_RESEARCH_CHANNEL_ID`: Channel ID for research posts (create `#research-agent`).
- `DISCORD_SCRIPT_CHANNEL_ID`: Channel ID for script posts (create `#script-agent`).

Brave Search API key is read from `openclaw.json` `env.BRAVE_API_KEY` (already provided by OpenClaw).

## Quality Standards

- TypeScript strict mode enabled.
- Responsive layout for mobile and desktop.
- Error handling with user-friendly messages.
- Loading states and spinners for async actions.
- No console errors in production build.

---

**Status**: Production-ready. Shipped with pride.
