const fs = require('fs');
const path = require('path');
const https = require('https');

// Workspace root: script is in <workspace>/agent-dashboard/skills/factory/research/
const WORKSPACE = process.env.WORKSPACE || path.resolve(__dirname, '..', '..', '..', '..');

function getOpenClawConfig() {
  const configPath = path.join(WORKSPACE, 'openclaw.json');
  try {
    const data = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to read openclaw.json:', e);
    return {};
  }
}

function getBraveApiKey() {
  if (process.env.BRAVE_API_KEY) return process.env.BRAVE_API_KEY;
  const cfg = getOpenClawConfig();
  return cfg.env?.BRAVE_API_KEY || cfg.braveApiKey || cfg.BRAVE_API_KEY || null;
}

// Generic HTTPS JSON fetch
function fetchJson(options, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const reqOptions = {
      hostname: options.hostname,
      port: options.port || 443,
      path: options.path,
      method: options.method || 'GET',
      headers: {
        ...options.headers,
        ...(data && { 'Content-Length': Buffer.byteLength(data) })
      }
    };
    const req = https.request(reqOptions, (res) => {
      let chunks = '';
      res.on('data', (c) => chunks += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(chunks);
          if (res.statusCode >= 400) {
            reject(new Error(`${res.statusCode}: ${JSON.stringify(json)}`));
          } else {
            resolve(json);
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    if (data) req.write(data);
    req.end();
  });
}

// Brave Search
async function braveSearch(query, count = 5) {
  const apiKey = getBraveApiKey();
  if (!apiKey) throw new Error('Missing Brave API key');
  const results = await fetchJson({
    hostname: 'api.search.brave.com',
    path: `/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`,
    headers: {
      'X-Subscription-Token': apiKey,
      'Accept': 'application/json'
    }
  });
  return results.web?.results?.map(r => ({
    title: r.title,
    url: r.url,
    description: r.description,
    source: 'brave'
  })) || [];
}

// Deduplicate and rank
function aggregateResults(allResults, max = 3) {
  const seen = new Set();
  const unique = [];
  for (const r of allResults) {
    if (!seen.has(r.url)) {
      seen.add(r.url);
      unique.push(r);
      if (unique.length >= max) break;
    }
  }
  return unique;
}

// Retry wrapper with exponential backoff
async function withRetry(fn, maxAttempts = 2, baseMs = 500) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (e) {
      attempt++;
      if (attempt >= maxAttempts) throw e;
      // If rate limited, back off longer
      const isRateLimit = e.message?.includes('429') || e.message?.includes('RATE_LIMITED');
      const delay = baseMs * (2 ** (attempt - 1)) * (isRateLimit ? 2.5 : 1);
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

// Main export
async function runResearch() {
  const queries = [
    'trending technology business opportunities 2026',
    'latest AI startup ideas',
    'emerging markets news'
  ];
  let all = [];
  for (const q of queries) {
    try {
      const results = await withRetry(() => braveSearch(q, 5), 2, 500);
      all = all.concat(results);
    } catch (e) {
      console.error(`Brave search failed for "${q}":`, e);
    }
  }
  const topStories = aggregateResults(all, 3);
  return { success: true, stories: topStories };
}

module.exports = { runResearch };

// If run directly, execute and print result
if (require.main === module) {
  runResearch().then(res => {
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  }).catch(err => {
    console.error('Research agent failed:', err);
    process.exit(1);
  });
}