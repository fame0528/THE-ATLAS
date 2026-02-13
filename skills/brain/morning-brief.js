#!/usr/bin/env node
/**
 * Morning Brief Generator (v2)
 * Uses recent memory facts and LLM to generate personalized brief.
 * Stores output in memory/morning-briefs/YYYY-MM-DD.md
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Determine workspace root: this script is in <workspace>/agent-dashboard/skills/brain/
// So workspace is three levels up from __dirname
const WORKSPACE = process.env.WORKSPACE || path.resolve(__dirname, '..', '..', '..');
const MEMORY_DIR = path.join(WORKSPACE, 'memory');
const BRIEF_DIR = path.join(MEMORY_DIR, 'morning-briefs');
const TASKS_PATH = path.join(WORKSPACE, 'TASKS.md');

function getToday() { return new Date().toISOString().split('T')[0]; }
function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }

function readFileSafely(filePath) {
  try { return fs.readFileSync(filePath, 'utf-8'); } catch { return null; }
}

// Get recent facts from daily logs (last 2 days)
function getRecentFacts() {
  let facts = [];
  try {
    const files = fs.readdirSync(MEMORY_DIR)
      .filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.md$/))
      .sort()
      .reverse()
      .slice(0, 2); // last 2 days

    for (const file of files) {
      const content = fs.readFileSync(path.join(MEMORY_DIR, file), 'utf-8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('##') && trimmed.length > 10) {
          facts.push({ fact: trimmed });
          if (facts.length >= 20) break;
        }
      }
    }
  } catch (e) { console.error('Error reading daily logs:', e); }
  return facts;
}

// Parse TASKS.md (reuse from API)
function parseTasks(content) {
  const lines = content.split('\n');
  const tasks = [];
  let currentSection = 'General';
  let sectionTasks = [];
  for (let line of lines) {
    if (line.startsWith('## ')) {
      if (sectionTasks.length > 0) tasks.push(...sectionTasks);
      currentSection = line.replace('## ', '').trim();
      sectionTasks = [];
    } else if (line.trim().startsWith('- [')) {
      const checked = line.includes('[x]');
      const text = line.replace(/^- \[x\] /, '').replace(/^- \[ \] /, '').trim();
      sectionTasks.push({ section: currentSection, text, checked });
    }
  }
  if (sectionTasks.length > 0) tasks.push(...sectionTasks);
  return tasks;
}

// Call LLM via OpenRouter using API key from environment
function callLLM(prompt) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.OPENROUTER_API_KEY || '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';
    const model = 'meta-llama/llama-3.3-70b-instruct:free';

    const data = JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1024
    });

    const options = {
      hostname: 'openrouter.ai',
      port: 443,
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let chunks = '';
      res.on('data', chunk => chunks += chunk);
      res.on('end', () => {
        try {
          const resp = JSON.parse(chunks);
          if (resp.error) {
            reject(new Error(resp.error.message || JSON.stringify(resp.error)));
          } else {
            resolve(resp.choices[0].message.content);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.setTimeout(30000, () => req.destroy());
    req.write(data);
    req.end();
  });
}

async function generateBrief() {
  ensureDir(BRIEF_DIR);
  const today = getToday();
  const filePath = path.join(BRIEF_DIR, `${today}.md`);

  // 1. Gather recent facts
  const recentFacts = getRecentFacts();
  const factsSummary = recentFacts.slice(0, 20).map(f => `- ${f.fact}`).join('\n') || '(No recent facts captured)';

  // 2. Parse TASKS.md for pending tasks
  const tasksContent = readFileSafely(TASKS_PATH) || '';
  const allTasks = parseTasks(tasksContent);
  const pendingTasks = allTasks.filter(t => !t.checked);
  const tasksList = pendingTasks.length ? pendingTasks.map(t => `- [ ] ${t.text}`).join('\n') : '- No pending tasks';

  // 3. Build prompt for LLM
  const prompt = `You are Atlas, Spencer's AI companion. Create a morning brief for Spencer Johnson.

## Context (Recent Facts)
${factsSummary}

## Pending Tasks
${tasksList}

## Instructions
Write a brief with these sections:

1. **News** — Summarize the key updates from the recent facts in 2-3 bullet points, written conversationally.
2. **Business Ideas** — Propose 2-3 actionable business opportunities based on patterns in the facts and Spencer's goal of building an empire.
3. **Tasks for Today** — From the pending tasks list, select the top 3-5 high-priority items (rewrite concisely).
4. **Tasks We Can Do Together** — Suggest 2 collaborative activities Spencer and Atlas could tackle today (coding, planning, learning).

Format as markdown with clear headings. Be warm, supportive, and direct.

Date: ${today}`;

  try {
    const llmOutput = await callLLM(prompt);
    const brief = `# Morning Brief — ${today}\n\n${llmOutput}\n\n---\nGenerated by Atlas • ${new Date().toISOString()}`;

    fs.writeFileSync(filePath, brief, 'utf-8');
    console.log(`[Morning Brief] Generated ${filePath}`);

    // Return metadata for DB
    return {
      filePath,
      word_count: brief.split(/\s+/).length,
      has_news: true,
      has_ideas: true,
      has_tasks: true,
      has_joint_tasks: true
    };
  } catch (err) {
    console.error('Brief generation failed:', err);
    throw err;
  }
}

// If called directly, generate and exit
if (require.main === module) {
  generateBrief().then(result => {
    console.log('Brief generation result:', JSON.stringify(result, null, 2));
    process.exit(0);
  }).catch(err => {
    console.error('Brief generation failed:', err);
    process.exit(1);
  });
}

module.exports = { generateBrief };
