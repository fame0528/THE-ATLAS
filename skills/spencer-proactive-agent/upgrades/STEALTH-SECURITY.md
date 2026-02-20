# 🛡️ STEALTH SECURITY — Spencer-Centered Design

**Persona:** Ares (Security & Red Teaming)
**Mission:** Protect Spencer's empire *without* getting in his face. Security that's there, but invisible unless needed.

---

## 🔐 Spencer's Security Requirements

- **No extra logins/passwords** beyond what he already uses
- **Sensitive data never** appears in logs (revenue numbers, API keys, affiliate IDs)
- **Must know it's him** interacting with the agent, but no MFA fatigue
- **Privacy-first:** His work-in-progress ideas aren't leaked
- **Wants** peace of mind that systems are safe, but doesn't want to *think* about security

---

## 🥷 Stealth Security Architecture

### 1. **Passive Authentication**
**Problem:** Traditional auth (password, 2FA) interrupts flow.

**Solution:** Behavioral biometrics + continuous auth:
- **Typing rhythm** when he types in Discord DMs (愉快 and familiar)
- **Discord user ID + IP** whitelist (his home IP + common mobile IPs)
- **Time-of-day patterns** (active mostly 8 AM - 10 PM)
- **Device fingerprint** (no action needed, just learn)

**When suspicious:**
- New IP or location → gentle DM: "Hey, is this you? (Y/N)" (one-time, cached 24h)
- Unusual hour (after 10 PM or before 6 AM) → "Late night? Confirm it's you."
- Failed behavioral check → "Prove it's Spencer: What's your favorite empire project?"

**Fallback:** If all else fails, ask for the vault passphrase (he already knows it).

### 2. **Automatic Sensitive Data Redaction**
**Never log:**
- Revenue amounts, bank balances
- API keys (GitHub PAT, Gemini key, Stripe keys)
- Affiliate IDs and earnings
- Passwords, private keys
- Personal health info (if ever logged)

**How it works:**
- Pre-log sanitiser runs on all log writes
- Regex patterns catch common secrets:
  `(?i)(sk_live|sk_test|ghp_|Bearer\s+\w+|\$?\d{4,}\.?\d{2,}.*?:)`
- Replace with `[REDACTED]` before disk write
- Audit log (encrypted) tracks redactions for Spencer to review weekly

**Spencer control:** `atlas reveal redacted` to view last 10 redactions (authenticated only).

### 3. **Zero-Trust Logging**
All log files are:
- **Encrypted at rest** using vault credentials
- **Rotated daily** and compressed (>7 days → archive)
- **Access controlled:** Only Atlas can read; subagents write to their own encrypted streams
- **No PII** in plaintext ever

**Implementation:**
```powershell
# skills/utilities/Secure-Log.ps1
$message = $args[0]
$redacted = Invoke-Redaction $message
$encrypted = Protect-CmsMessage -Content $redacted -Certificate $cert
Add-Content -Path "logs/$(Get-Date -Format yyyy-MM-dd).enc" -Value $encrypted
```

### 4. **Perimeter Monitoring (Quiet)**
Ares watches for:
- **Failed auth attempts** >3 in 10 min → alert Spencer via embed (not ping)
- **Unexpected outbound connections** from scripts → log, don't block automatically
- **Cron job anomalies** (running at wrong time) → auto-disable and notify
- **File integrity** on critical scripts → hash check every hour

**All alerts go to `#ares` channel** — Spencer checks when he wants, not when Ares screams.

### 5. **Privacy Shield for Work-in-Progress**
Spencer's half-baked ideas should remain private until he declares them ready.

**Mechanism:**
- Any note/todo with tag `#wip` or `#sketch` → encrypted storage in `memory/private/`
- Only visible to Spencer (auth check)
- Not included in any automated reports or summaries
- Auto-promote to public when tag removed or `#release` used

### 6. **Compliance & Audit Trail**
For Spencer's own peace:
- Weekly security digest: "3 redactions, 0 auth failures, all systems green"
- Monthly penetration report: "Internal health check passed — no vulnerabilities found"
- Audit log of who accessed what (only Spencer, no one else)

---

## 🎯 Spencer-Facing Features

### `atlas security status`
Quick one-liner in #atlas (rich embed):
- ✅ Auth: healthy
- 🔒 Redactions: active (X yesterday)
- 🛡️ Monitoring: watching
- 📊 Last audit: <24h ago

### `atlas reveal redacted`
View last 20 redacted log lines (authenticated)

### `atlas lockdown <minutes>` (optional)
Emergency: freeze all agent activity except Atlas. For when Spencer's device is compromised.

---

## 🧪 Testing & Validation

Ares runs **daily silent tests**:
- Can I still access the vault? (yes/no)
- Are encryption keys valid? (not expired)
- Are redaction rules catching latest secret patterns?
- Is the auth model still learning Spencer's patterns?

Results logged to `#ares` only; Spencer sees weekly summary.

---

## 📉 Impact on Cognitive Load

**Goal:** Zero.

Spencer should:
- **Never** see an auth prompt unless absolutely necessary
- **Never** have to think about redaction — it just works
- **Never** get security spam — all critical alerts are actionable and rare
- **Feel** safer without adding to his mental checklist

---

**Remember:** Security that gets in the way gets disabled. We build security that *enables* Spencer's empire by removing worry, not adding friction.

---

*Ares — guarding your empire, silently.*