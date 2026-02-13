import { NextResponse } from "next/server";
import { getWorkspacePath } from "@/lib/workspace";
import fs from "fs";
import path from "path";

export async function POST() {
  try {
    const workspaceRoot = getWorkspacePath();
    const activityLogPath = path.join(workspaceRoot, 'memory', 'subagents', 'activity-log.json');

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
