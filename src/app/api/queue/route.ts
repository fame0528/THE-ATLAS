import { NextResponse } from "next/server";

export async function GET() {
  try {
    const queuePath = "C:\\Users\\spenc\\.openclaw\\workspace\\skills\\subagent-system\\task-queue.json";
    const fs = await import("fs");
    const data = JSON.parse(fs.readFileSync(queuePath, "utf-8"));
    
    // Extract relevant summary
    const summary = {
      pending: data.tasks?.length || 0,
      running: data.runningSessions?.length || 0,
      totalEnqueued: data.stats?.totalEnqueued || 0,
      totalCompleted: data.stats?.totalCompleted || 0,
      totalFailed: data.stats?.totalFailed || 0,
      health: data.lastHealthCheck ? "healthy" : "unknown"
    };

    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read queue", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
