import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Determine workspace root: this file is in agent-dashboard/src/app/api/subagents/clear-log/route.ts
// So go up 4 levels: clear-log -> subagents -> api -> src -> agent-dashboard -> workspace
const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const activityLogPath = path.join(WORKSPACE_ROOT, 'memory', 'subagents', 'activity-log.json');

export async function POST() {
  try {
    // Clear activity log
    if (fs.existsSync(activityLogPath)) {
      fs.writeFileSync(activityLogPath, JSON.stringify({ version: '1.0.0', entries: [] }, null, 2));
    }
    
    return NextResponse.json({ success: true, message: 'Activity log cleared' });
  } catch (error) {
    console.error("Failed to clear activity log:", error);
    return NextResponse.json(
      { error: "Failed to clear activity log", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
