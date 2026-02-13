import { NextRequest, NextResponse } from 'next/server';
import { getWorkspacePath } from '@/lib/workspace';
import { readFile, mkdir } from 'fs/promises';
import { join, resolve } from 'path';
import { insertMorningBrief, getMorningBriefByDate } from '@/lib/db';
import { generateBrief } from '@/lib/brief';

const BRIEF_DIR = join(getWorkspacePath(), 'memory', 'morning-briefs');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const targetDate = date || new Date().toISOString().split('T')[0];
    const filePath = join(BRIEF_DIR, `${targetDate}.md`);

    try {
      await mkdir(BRIEF_DIR, { recursive: true });
      const content = await readFile(filePath, 'utf-8');
      return NextResponse.json({ date: targetDate, content, generated: true });
    } catch {
      return NextResponse.json({ date: targetDate, content: null, generated: false });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read brief' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await generateBrief();

    // Insert/update index in DB (convert booleans to numbers for SQLite)
    const today = new Date().toISOString().split('T')[0];
    insertMorningBrief({
      date: today,
      file_path: result.filePath,
      generated_at: new Date().toISOString(),
      word_count: result.word_count,
      has_news: result.has_news ? 1 : 0,
      has_ideas: result.has_ideas ? 1 : 0,
      has_tasks: result.has_tasks ? 1 : 0,
      has_joint_tasks: result.has_joint_tasks ? 1 : 0,
    });

    // Try to post to Discord
    try {
      const workspacePath = getWorkspacePath();
      const configPath = resolve(workspacePath, '..', 'openclaw.json');
      const configContent = await readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent);
      const token = process.env.DISCORD_BOT_TOKEN || config.channels?.discord?.token;
      const channelId = process.env.DISCORD_BRIEF_CHANNEL_ID || config.discord?.briefChannelId || '';

      if (token && channelId) {
        const content = await readFile(result.filePath, 'utf-8');
        const postData = JSON.stringify({ content });
        const https = require('https');
        await new Promise<void>((resolve, reject) => {
          const req = https.request({
            hostname: 'discord.com',
            port: 443,
            path: `/api/channels/${channelId}/messages`,
            method: 'POST',
            headers: {
              'Authorization': `Bot ${token}`,
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData)
            }
          }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
              if (res.statusCode >= 400) reject(new Error(`Discord ${res.statusCode}: ${data}`));
              else resolve();
            });
          });
          req.on('error', reject);
          req.write(postData);
          req.end();
        });
      }
    } catch (e) {
      console.warn('Brief Discord posting failed (continuing):', e);
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Brief generation error:', error);
    return NextResponse.json({
      error: 'Failed to generate brief',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}