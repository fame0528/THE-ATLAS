import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getWorkspacePath } from '@/lib/workspace';
import { resolve } from 'path';
import fs from 'fs';
import https from 'https';

function checkBraveAPI(apiKey: string): Promise<{ok: boolean, error?: string}> {
  return new Promise((resolve) => {
    if (!apiKey) return resolve({ ok: false, error: 'No API key' });
    const req = https.request({
      hostname: 'api.search.brave.com',
      port: 443,
      path: '/res/v1/web/search?q=test&count=1',
      method: 'GET',
      headers: { 'X-Subscription-Token': apiKey }
    }, (res) => {
      if (res.statusCode === 200) resolve({ ok: true });
      else if (res.statusCode === 401 || res.statusCode === 403) resolve({ ok: false, error: 'Invalid Brave API key' });
      else if (res.statusCode === 429) resolve({ ok: true, error: 'Rate limited' }); // still ok
      else resolve({ ok: false, error: `HTTP ${res.statusCode}` });
    });
    req.on('error', (e) => resolve({ ok: false, error: e.message }));
    req.setTimeout(5000, () => { req.destroy(); resolve({ ok: false, error: 'timeout' }); });
    req.end();
  });
}

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // DB check
  try {
    const stmt = db.prepare('SELECT 1 as test');
    stmt.get();
    results.checks.db = { ok: true };
  } catch (e) {
    results.checks.db = { ok: false, error: (e as Error).message };
  }

  // Config check
  try {
    const workspacePath = getWorkspacePath();
    const configPath = resolve(workspacePath, '..', 'openclaw.json');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    const braveKey = config.env?.BRAVE_API_KEY || '';
    const discordToken = process.env.DISCORD_BOT_TOKEN || config.channels?.discord?.token;
    results.checks.config = {
      ok: true,
      hasBrave: !!braveKey,
      hasDiscord: !!discordToken
    };
    // Brave API quick check (async but we await)
    const braveCheck = await checkBraveAPI(braveKey);
    results.checks.brave = braveCheck;
  } catch (e) {
    results.checks.config = { ok: false, error: (e as Error).message };
    results.checks.brave = { ok: false, error: 'Skipped due to config error' };
  }

  // Overall status
  const allOk = results.checks.db?.ok && results.checks.config?.ok && results.checks.brave?.ok;
  results.status = allOk ? 'healthy' : 'degraded';

  return NextResponse.json(results, { status: allOk ? 200 : 503 });
}