import { NextRequest, NextResponse } from 'next/server';
import { getWorkspacePath } from '@/lib/workspace';
import { resolve } from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const workspacePath = getWorkspacePath();
    const configPath = resolve(workspacePath, '..', 'openclaw.json');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    const discordToken = process.env.DISCORD_BOT_TOKEN || config.channels?.discord?.token;
    const researchChannel = process.env.DISCORD_RESEARCH_CHANNEL_ID || config.discord?.researchChannelId;
    const scriptChannel = process.env.DISCORD_SCRIPT_CHANNEL_ID || config.discord?.scriptChannelId;
    const briefChannel = process.env.DISCORD_BRIEF_CHANNEL_ID || config.discord?.briefChannelId;

    return NextResponse.json({
      ok: true,
      config: {
        hasDiscordToken: !!discordToken,
        researchChannelId: researchChannel || null,
        scriptChannelId: scriptChannel || null,
        briefChannelId: briefChannel || null,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}