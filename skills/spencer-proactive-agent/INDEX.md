# Spencer Proactive Agent — Quick Navigation

## First Time?

1. Read **SPENCER-HANDOFF.md** — activation guide
2. Run `scheduling\install-cron.ps1` to enable automation
3. Read **HANDBOOK.md** to understand daily operation
4. Print **QUICKREF.txt** for desk reference

---

## By Purpose

### Installation & Setup
- `SPENCER-HANDOFF.md` — step-by-step activation
- `INTEGRATION-GUIDE.md` — connecting to your systems
- `scheduling\install-cron.ps1` — add cron jobs
- `scheduling\verify-cron.ps1` — check installation

### Daily Use
- `QUICKREF.txt` — one-page cheat sheet (print this!)
- `HANDBOOK.md` — comprehensive daily rhythm and operations
- `README.md` — overview and quick start

### Troubleshooting
- `FAQ.md` — common questions
- `scheduling\uninstall-cron.ps1` — clean removal
- `scripts\recover-context.ps1` — rebuild after overflow
- `SECURITY-AUDIT.md` — security details

### Configuration
- `CONFIGURATION.md` — all tunable settings
- `scheduling\cron-jobs.json` — edit job schedules here
- `scripts\empire-metrics.ps1` — add custom metrics

### Technical Deep Dive
- `WAL-ENHANCEMENT.md` — memory protocol details
- `scripts\working-buffer.ps1` — buffer implementation
- `scripts\wellness-harmony.ps1` — self-care coordination

---

## Scripts Reference

| Script | Purpose | Run Frequency |
|--------|---------|---------------|
| `working-buffer.ps1` | Context buffer logger | Every 30 min |
| `empire-metrics.ps1` | Income bot health check | Every 6h |
| `proactive-checkin.ps1` | Gentle daytime nudge | 6 PM / 8 PM |
| `wellness-harmony.ps1` | Prevent notification conflicts | Every 6h |
| `recover-context.ps1` | Manual recovery after overflow | As needed |
| `sanitize-paths.ps1` | Fix hardcoded paths | Once if errors |
| `notify_progress.ps1` | Swarm persona progress reporter | As needed |
| `notify_simple.ps1` | Lightweight notification sender | As needed |
| `swarm_log.ps1` | Swarm activity logger | During swarms |
| `task-audit.ps1` | Task execution audit logger | As needed |
| `security-audit.sh` | Security checks (bash) | As needed |
| `test-simple.ps1` | Basic test script | Testing |

---

## File Map

```
spencer-proactive-agent/
├── Core Docs
│   ├── README.md               ← Start here
│   ├── SPENCER-HANDOFF.md      ← Activation steps
│   ├── HANDBOOK.md             ← Daily use guide
│   ├── QUICKREF.txt            ← Cheat sheet
│   ├── FAQ.md                  ← Q&A
│   ├── CONFIGURATION.md        ← Settings
│   ├── WAL-ENHANCEMENT.md      ← Memory protocol
│   ├── INTEGRATION-GUIDE.md    ← Setup help
│   └── SECURITY-AUDIT.md       ← Security review
│
├── Scripts (scripts/)
│   ├── working-buffer.ps1
│   ├── recover-context.ps1
│   ├── empire-metrics.ps1
│   ├── proactive-checkin.ps1
│   ├── wellness-harmony.ps1
│   ├── notify_progress.ps1
│   ├── notify_simple.ps1
│   ├── swarm_log.ps1
│   ├── sanitize-paths.ps1
│   ├── task-audit.ps1
│   ├── security-audit.sh
│   └── test-simple.ps1
│
├── Integrations (integrations/)
│   └── discord.ps1
│
├── Scheduling (scheduling/)
│   ├── cron-jobs.json
│   ├── install-cron.ps1
│   ├── verify-cron.ps1
│   └── uninstall-cron.ps1
│
└── Assets (from original skill)
    └── (onboarding templates — not used)
---

## Quick Commands

```powershell
# Install
scheduling\install-cron.ps1

# Verify
scheduling\verify-cron.ps1

# Test
scripts\empire-metrics.ps1

# Uninstall
scheduling\uninstall-cron.ps1

# Manual recovery
scripts\recover-context.ps1 -Force
```

---

**Need help?** Read HANDBOOK.md or ask Atlas in #atlas.
