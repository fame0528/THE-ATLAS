#!/usr/bin/env node
// swarm_log.js - Swarm Activity Logger (Node.js Port)
// V6.0 - Platinum Standard: Cross-Platform / Robust / Real-Time
// Replaces swarm_log.ps1 for reliable execution from OpenClaw exec tool.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// --- CONFIGURATION ---
const LOGS_ROOT = 'C:\\Users\\spenc\\Documents\\Obsidian\\Vaults\\Atlas\\Resources\\Olympus\\Logs';
const OPENCLAW_CMD = 'C:\\Users\\spenc\\AppData\\Roaming\\npm\\openclaw.cmd';
const STATE_FILE = path.join(LOGS_ROOT, '.active-swarm.txt');
const ACTIVITY_FILE = path.join(LOGS_ROOT, '.active-activity.json');

// --- EMOJI MAPPINGS ---
const EMOJI_MAP = {
    atlas: '\u{1F5FA}', // World Map
    ares: '\u{1F6E1}', // Shield
    athena: '\u{1F989}', // Owl
    epimetheus: '\u{1F4DC}', // Scroll
    hephaestus: '\u{1F528}', // Hammer
    hermes: '\u{1F4E8}', // Incoming Envelope
    hyperion: '\u{1F52D}', // Telescope
    kronos: '\u23F3',    // Hourglass
    mnemosyne: '\u{1F9E0}', // Brain
    prometheus: '\u{1F525}', // Fire
};

const ROLE_MAP = {
    atlas: 'Orchestrator', ares: 'Security', athena: 'Architect',
    epimetheus: 'Scribe', hephaestus: 'Builder', hermes: 'Messenger',
    hyperion: 'Monitor', kronos: 'Scheduler', mnemosyne: 'Memory',
    prometheus: 'Innovator',
};

const CHANNEL_MAP = {
    atlas: 'channel:1471955220194918645',
    ares: 'channel:1472997717637857332',
    athena: 'channel:1472997751603068991',
    epimetheus: 'channel:1472997781990932624',
    hephaestus: 'channel:1472997817428480192',
    hermes: 'channel:1472997853105491968',
    hyperion: 'channel:1472997889927282873',
    kronos: 'channel:1472997916078641364',
    mnemosyne: 'channel:1472997945208213515',
    prometheus: 'channel:1472997978359861350',
};

const ACTION_MAP = {
    assign: '\u{1F4CB} **[ASSIGN]**',  // Clipboard
    entry: '\u{1F4CC} **[INFO]**',    // Pushpin
    learn: '\u{1F4A1} **[LEARN]**', // Bulb
    change: '\u{1F527} **[CHANGE]**',  // Wrench
    audit: '\u{1F50E} **[AUDIT]**',   // Magnifying Glass
    issue: '\u{1F534} **[ISSUE]**',   // Red Circle
    fix: '\u{1F691} **[FIX]**',     // Ambulance
    result: '\u2705 **[RESULT]**',     // Check Mark
    detail: '\u{1F4CE} **[DETAIL]**',  // Paperclip
};

const VALID_ACTIONS = ['init', 'assign', 'entry', 'learn', 'change', 'audit', 'issue', 'fix', 'result', 'detail', 'finalize'];
const VALID_AGENTS = Object.keys(EMOJI_MAP);

// --- ARGUMENT PARSING ---
function parseArgs() {
    const args = {};
    const raw = process.argv.slice(2);
    for (let i = 0; i < raw.length; i++) {
        let key = raw[i];
        if (key.startsWith('-')) {
            key = key.replace(/^-+/, '').toLowerCase();
            const val = (i + 1 < raw.length && !raw[i + 1].startsWith('-')) ? raw[++i] : true;
            args[key] = val;
        }
    }
    return args;
}

// --- HELPERS ---
function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getTimestamp() {
    const d = new Date();
    return d.toTimeString().split(' ')[0]; // HH:MM:SS
}

function getTimeTag() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}`;
}

function getToday() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getActiveLogPath() {
    if (fs.existsSync(STATE_FILE)) {
        return fs.readFileSync(STATE_FILE, 'utf8').trim();
    }
    return null;
}

function appendFile(filePath, content) {
    fs.appendFileSync(filePath, content + '\n', 'utf8');
}

function writeFile(filePath, content) {
    fs.writeFileSync(filePath, content + '\n', 'utf8');
}

function sendDiscord(channelId, message) {
    if (!fs.existsSync(OPENCLAW_CMD)) {
        console.log('[discord] openclaw not found, skipping notification');
        return;
    }
    try {
        const safeMsg = message.replace(/"/g, '\\"');
        execSync(`"${OPENCLAW_CMD}" message send --channel discord -t ${channelId} -m "${safeMsg}"`, {
            timeout: 15000,
            stdio: 'ignore'
        });
    } catch (e) {
        console.log(`[discord] Send failed: ${e.message}`);
    }
}

function generateImpactReport(logPath) {
    if (!fs.existsSync(logPath)) return '';
    const content = fs.readFileSync(logPath, 'utf8');
    const issues = (content.match(/Issue.*?\|/g) || []).length;
    const fixes = (content.match(/Fix.*?\|/g) || []).length;
    const results = (content.match(/Result.*?\|/g) || []).length;
    return `### Impact Summary\n- **Issues Found:** ${issues}\n- **Fixes Applied:** ${fixes}\n- **Verified Results:** ${results}`;
}

// --- MAIN LOGIC ---
function main() {
    const args = parseArgs();
    const action = (args.action || '').toLowerCase();
    const agent = (args.agent || '').toLowerCase();
    const entry = args.entry || '';
    const mission = args.mission || '';
    const summary = args.summary || '';
    const noDiscord = args.nodiscord === true || args.nodiscord === 'true';

    if (!action || !VALID_ACTIONS.includes(action)) {
        console.error(`ERROR: Invalid action "${action}". Valid: ${VALID_ACTIONS.join(', ')}`);
        process.exit(1);
    }

    const today = getToday();
    const timestamp = getTimestamp();
    const timeTag = getTimeTag();
    const dayDir = path.join(LOGS_ROOT, today);

    // 1. INIT
    if (action === 'init') {
        if (!mission) {
            console.error('ERROR: Mission required for init.');
            process.exit(1);
        }

        ensureDir(LOGS_ROOT);
        ensureDir(dayDir);

        const safeMission = mission.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
        const logFile = path.join(dayDir, `SWARM-${safeMission}-${timeTag}.md`);

        const header = [
            `# \u{1F99E} SWARM LOG: ${mission}`,
            `**Date:** ${today}`,
            `**Start Time:** ${timestamp}`,
            `**Status:** \u{1F7E2} Active`,
            `**Protocol:** Platinum Standard (Single Thread / Zero Tolerance)`,
            '',
            '---',
            '',
            `## \u{1F3DB} Mission Dashboard`,
            '',
            '| Agent | Status | Current Task | Last Update |',
            '|---|---|---|---|',
        ].join('\n');

        writeFile(logFile, header);
        writeFile(STATE_FILE, logFile);

        // Init activity JSON
        const activity = {};
        for (const a of VALID_AGENTS) {
            activity[a] = { Status: 'Idle', Task: '-', LastUpdate: '-' };
        }
        writeFile(ACTIVITY_FILE, JSON.stringify(activity, null, 2));

        console.log(`SUCCESS: Swarm Initialized: ${logFile}`);
        return;
    }

    // 2. FINALIZE
    if (action === 'finalize') {
        const logFile = getActiveLogPath();
        if (!logFile) {
            console.error('ERROR: No active swarm log.');
            process.exit(1);
        }

        const impact = generateImpactReport(logFile);
        const footer = [
            '',
            '---',
            `## \u{1F3C1} Mission Debrief`,
            `**End Time:** ${timestamp}`,
            `**Summary:** ${summary}`,
            '',
            impact,
            '',
            `**Mission Status:** \u2705 COMPLETE`,
        ].join('\n');

        appendFile(logFile, footer);

        if (fs.existsSync(STATE_FILE)) fs.unlinkSync(STATE_FILE);
        if (fs.existsSync(ACTIVITY_FILE)) fs.unlinkSync(ACTIVITY_FILE);

        console.log('SUCCESS: Swarm Finalized.');

        if (!noDiscord) {
            const msg = `\u{1F3C1} **SWARM DEBRIEF:** ${summary}\n${impact}`;
            sendDiscord(CHANNEL_MAP.atlas, msg);
        }
        return;
    }

    // 3. LOGGING ACTIONS
    if (!agent || !VALID_AGENTS.includes(agent)) {
        console.error(`ERROR: Invalid agent "${agent}". Valid: ${VALID_AGENTS.join(', ')}`);
        process.exit(1);
    }

    const logFile = getActiveLogPath();
    if (!logFile) {
        console.log('WARNING: No active log. Writing to console only.');
    }

    const icon = EMOJI_MAP[agent] || '';
    const actIcon = ACTION_MAP[action] || action;
    const mdLine = `| ${timestamp} | **${icon} ${agent}** | ${actIcon} | ${entry} |`;

    // Write to log
    if (logFile && fs.existsSync(logFile)) {
        const content = fs.readFileSync(logFile, 'utf8');
        if (!content.includes('Activity Log')) {
            appendFile(logFile, `\n## \u{1F4DC} Activity Log\n\n| Time | Agent | Action | Details |\n|---|---|---|---|`);
        }
        appendFile(logFile, mdLine);
    }

    // Update JSON state
    if (fs.existsSync(ACTIVITY_FILE)) {
        try {
            const json = JSON.parse(fs.readFileSync(ACTIVITY_FILE, 'utf8'));
            if (json[agent]) {
                if (action === 'assign') {
                    json[agent].Status = 'Active';
                    json[agent].Task = entry;
                } else if (action === 'result') {
                    json[agent].Status = 'Done';
                }
                json[agent].LastUpdate = timestamp;
                writeFile(ACTIVITY_FILE, JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.log(`WARNING: Activity state update failed: ${e.message}`);
        }
    }

    // Discord notification
    if (!noDiscord) {
        const channelId = CHANNEL_MAP[agent] || CHANNEL_MAP.atlas;
        let safeMsg = `${icon} **${agent.toUpperCase()}** ${actIcon} ${entry}`;
        if (action === 'assign') {
            safeMsg = `${icon} **${agent.toUpperCase()}** ${actIcon} ${entry}`;
        }
        sendDiscord(channelId, safeMsg);
    }

    console.log(`SUCCESS: ${icon} ${agent} ${actIcon} : ${entry}`);
}

main();
