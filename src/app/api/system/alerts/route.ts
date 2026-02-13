import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ALERTS_PATH = "C:\\Users\\spenc\\.openclaw\\workspace\\memory\\ALERTS.md";

export async function GET() {
    try {
        if (!fs.existsSync(ALERTS_PATH)) {
            return NextResponse.json({ alerts: [], count: 0 });
        }

        const content = fs.readFileSync(ALERTS_PATH, "utf-8");
        const lines = content.split("\n");

        // Parse alert entries: [timestamp] [SEVERITY] Message
        const alerts = lines
            .filter((l) => l.match(/^\[.+\]\s*\[/))
            .map((line) => {
                const match = line.match(
                    /^\[([^\]]+)\]\s*\[([^\]]+)\]\s*(.*)/
                );
                if (match) {
                    return {
                        timestamp: match[1],
                        severity: match[2].trim().toUpperCase(),
                        message: match[3].trim(),
                    };
                }
                return { timestamp: "", severity: "INFO", message: line };
            })
            .reverse(); // newest first

        return NextResponse.json({ alerts: alerts.slice(0, 20), count: alerts.length });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to read alerts", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
