import { NextRequest, NextResponse } from 'next/server';
import { upsertContentFactoryState, getContentFactoryState } from '@/lib/db';
import { getWorkspacePath } from '@/lib/workspace';
import { join, resolve } from 'path';
import fs from 'fs';
import { runResearch } from '@/lib/agents/research';

export async function POST(request: NextRequest) {
  try {
    // Mark running
    await upsertContentFactoryState({
      agent_type: 'research',
      channel_id: '',
      last_message_id: '',
      status: 'running',
      last_run_at: new Date().toISOString(),
      error_message: null,
      last_output_preview: ''
    });

    const result = await runResearch();
    const { stories } = result;

    // Try to post to Discord if configured
    const workspacePath = getWorkspacePath();
    const configPath = resolve(workspacePath, '..', 'openclaw.json');
    let config: any = {};
    try {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      config = JSON.parse(configContent);
    } catch (e) {
      console.warn('Could not read openclaw.json for Discord config:', e);
    }

    const discordToken = process.env.DISCORD_BOT_TOKEN || config.channels?.discord?.token;
    const channelId = process.env.DISCORD_RESEARCH_CHANNEL_ID || config.discord?.researchChannelId || '';

    if (discordToken && channelId) {
      const date = new Date().toISOString().split('T')[0];
      const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
      let content = `🛰️ **Research Agent Output** — ${date}\n\n`;
      const labels = ['**Top Story**', '**Secondary**', '**Tertiary**'];
      for (let i = 0; i < stories.length; i++) {
        const s = stories[i];
        content += `${labels[i] || `**Story ${i+1}**`}: ${s.title}\n${s.url}\n${s.description}\n\n`;
      }
      content += `---\n*Automated by Atlas • ${timestamp}*`;

      const postData = JSON.stringify({ content });
      // Inline HTTPS request to Discord
      const https = require('https');
      await new Promise<void>((resolve, reject) => {
        const req = https.request({
          hostname: 'discord.com',
          port: 443,
          path: `/api/channels/${channelId}/messages`,
          method: 'POST',
          headers: {
            'Authorization': `Bot ${discordToken}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        }, (res) => {
          let data = '';
          res.on('data', (c) => data += c);
          res.on('end', () => {
            if (res.statusCode >= 400) {
              reject(new Error(`Discord ${res.statusCode}: ${data}`));
            } else {
              resolve();
            }
          });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
      });
    }

    // Update DB with success, including preview
    await upsertContentFactoryState({
      agent_type: 'research',
      channel_id: channelId || '',
      last_message_id: '',
      last_output_preview: JSON.stringify({ timestamp: new Date().toISOString(), stories }),
      last_run_at: new Date().toISOString(),
      status: 'success',
      error_message: null
    });

    return NextResponse.json({ success: true, stories });
  } catch (error: any) {
    console.error('Research agent error:', error);
    await upsertContentFactoryState({
      agent_type: 'research',
      channel_id: '',
      last_message_id: '',
      status: 'error',
      error_message: error.message,
      last_run_at: new Date().toISOString()
    });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const state = getContentFactoryState('research');
    return NextResponse.json({ agent: 'research', state });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}