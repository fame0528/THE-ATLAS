import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Determine workspace root: this file is in agent-dashboard/src/app/api/subagents/preferences/route.ts
// So go up 5 levels: route.ts -> preferences -> subagents -> api -> src -> agent-dashboard -> workspace
const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..');
const PREFERENCES_PATH = path.join(WORKSPACE_ROOT, 'memory', 'dashboard-preferences.json');

interface Preferences {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  progressFrequency: number; // seconds
}

const DEFAULT_PREFERENCES: Preferences = {
  notificationsEnabled: true,
  soundEnabled: true,
  progressFrequency: 30
};

/**
 * Read preferences file
 */
function readPreferences(): Preferences {
  try {
    if (!fs.existsSync(PREFERENCES_PATH)) {
      return DEFAULT_PREFERENCES;
    }
    const content = fs.readFileSync(PREFERENCES_PATH, 'utf-8');
    const prefs = JSON.parse(content) as Partial<Preferences>;
    // Merge with defaults for missing fields
    return { ...DEFAULT_PREFERENCES, ...prefs };
  } catch (error) {
    console.error('Failed to read preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Write preferences file
 */
function writePreferences(prefs: Preferences): boolean {
  try {
    const dir = path.dirname(PREFERENCES_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PREFERENCES_PATH, JSON.stringify(prefs, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to write preferences:', error);
    return false;
  }
}

export async function GET() {
  const prefs = readPreferences();
  return NextResponse.json(prefs);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate fields
    const notificationsEnabled = typeof body.notificationsEnabled === 'boolean'
      ? body.notificationsEnabled
      : DEFAULT_PREFERENCES.notificationsEnabled;
    const soundEnabled = typeof body.soundEnabled === 'boolean'
      ? body.soundEnabled
      : DEFAULT_PREFERENCES.soundEnabled;
    const progressFrequency = [30, 60, 300].includes(body.progressFrequency)
      ? body.progressFrequency
      : DEFAULT_PREFERENCES.progressFrequency;

    const prefs = {
      notificationsEnabled,
      soundEnabled,
      progressFrequency
    };

    if (!writePreferences(prefs)) {
      return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
    }

    return NextResponse.json({ success: true, preferences: prefs });
  } catch (error) {
    console.error('Failed to parse preferences:', error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
