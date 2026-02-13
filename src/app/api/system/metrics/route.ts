import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const WORKSPACE = "C:\\Users\\spenc\\.openclaw\\workspace";
const OPENCLAW_ROOT = "C:\\Users\\spenc\\.openclaw";

interface SystemMetrics {
    gateway: { status: string; pid: number | null; uptime: string | null };
    dashboard: { status: string };
    sessions: { active: number; total: number; stale: number };
    queue: { pending: number; running: number; completed: number; failed: number };
    memory: { logCount: number; latestLog: string | null; alertCount: number };
    context: { usage: string; percentage: number };
    lastUpdated: string;
}

export async function GET() {
    try {
        const metrics: SystemMetrics = {
            gateway: { status: "unknown", pid: null, uptime: null },
            dashboard: { status: "running" },
            sessions: { active: 0, total: 0, stale: 0 },
            queue: { pending: 0, running: 0, completed: 0, failed: 0 },
            memory: { logCount: 0, latestLog: null, alertCount: 0 },
            context: { usage: "N/A", percentage: 0 },
            lastUpdated: new Date().toISOString(),
        };

        // 1. Gateway status - check if port 3000 is responding
        try {
            const http = await import("http");
            await new Promise<void>((resolve) => {
                const req = http.request(
                    { hostname: "127.0.0.1", port: 3000, path: "/", method: "HEAD", timeout: 2000 },
                    (res) => {
                        metrics.gateway.status = "running";
                        resolve();
                    }
                );
                req.on("error", () => {
                    metrics.gateway.status = "down";
                    resolve();
                });
                req.on("timeout", () => {
                    metrics.gateway.status = "down";
                    req.destroy();
                    resolve();
                });
                req.end();
            });
        } catch {
            metrics.gateway.status = "down";
        }

        // 2. Sessions stats
        try {
            const sessionsDir = path.join(OPENCLAW_ROOT, "agents", "main", "sessions");
            if (fs.existsSync(sessionsDir)) {
                const sessionFiles = fs.readdirSync(sessionsDir).filter((f) => f.endsWith(".md") || f.endsWith(".json"));
                metrics.sessions.total = sessionFiles.length;

                // Check sessions.json for active sessions
                const sessionsJsonPath = path.join(sessionsDir, "sessions.json");
                if (fs.existsSync(sessionsJsonPath)) {
                    try {
                        const sessionsData = JSON.parse(fs.readFileSync(sessionsJsonPath, "utf-8"));
                        const sessions = Array.isArray(sessionsData) ? sessionsData : sessionsData.sessions || [];
                        const now = Date.now();
                        const oneHourAgo = now - 60 * 60 * 1000;

                        metrics.sessions.active = sessions.filter(
                            (s: any) => s.status === "active" || (s.startedAt && new Date(s.startedAt).getTime() > oneHourAgo && s.status !== "completed")
                        ).length;

                        const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
                        metrics.sessions.stale = sessions.filter(
                            (s: any) => s.status === "active" && s.startedAt && new Date(s.startedAt).getTime() < twentyFourHoursAgo
                        ).length;
                    } catch { /* corrupted sessions.json */ }
                }
            }
        } catch { /* sessions dir doesn't exist */ }

        // 3. Queue stats
        try {
            const queuePath = path.join(WORKSPACE, "skills", "subagent-system", "task-queue.json");
            if (fs.existsSync(queuePath)) {
                const queueData = JSON.parse(fs.readFileSync(queuePath, "utf-8"));
                metrics.queue = {
                    pending: queueData.tasks?.filter((t: any) => t.status === "pending").length || 0,
                    running: queueData.runningSessions?.length || 0,
                    completed: queueData.stats?.totalCompleted || 0,
                    failed: queueData.stats?.totalFailed || 0,
                };
            }
        } catch { /* queue file doesn't exist */ }

        // 4. Memory log stats
        try {
            const memoryDir = path.join(WORKSPACE, "memory");
            if (fs.existsSync(memoryDir)) {
                const logFiles = fs.readdirSync(memoryDir).filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f));
                metrics.memory.logCount = logFiles.length;
                if (logFiles.length > 0) {
                    metrics.memory.latestLog = logFiles.sort().pop() || null;
                }

                // Count recent alerts
                const alertsPath = path.join(memoryDir, "ALERTS.md");
                if (fs.existsSync(alertsPath)) {
                    const alertContent = fs.readFileSync(alertsPath, "utf-8");
                    const alertLines = alertContent.split("\n").filter((l) => l.match(/^\[.+\]\s*\[/));
                    metrics.memory.alertCount = alertLines.length;
                }
            }
        } catch { /* memory dir issue */ }

        // 5. Context / session state
        try {
            const sessionStatePath = path.join(WORKSPACE, "SESSION-STATE.md");
            if (fs.existsSync(sessionStatePath)) {
                const content = fs.readFileSync(sessionStatePath, "utf-8");
                const lines = content.split("\n").length;
                // Rough context estimation: typical max ~4000 lines, percentage based on size
                const maxContext = 4000;
                const pct = Math.min(Math.round((lines / maxContext) * 100), 100);
                metrics.context = {
                    usage: `${lines} lines`,
                    percentage: pct,
                };
            }
        } catch { /* session state missing */ }

        return NextResponse.json(metrics);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to gather metrics", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
