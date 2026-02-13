import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST() {
  try {
    // Check if agent-drift-detector is installed
    try {
      await execAsync("agent-drift --version", { timeout: 5000 });
    } catch {
      return NextResponse.json({
        success: false,
        error: "Agent-Drift detector not installed",
        message: "Install with: pip install agent-drift-detector"
      });
    }

    // Run a security scan
    const scanResult = await execAsync("agent-drift scan --quick", {
      timeout: 60000,
      maxBuffer: 1024 * 1024
    });

    // Parse the output (basic parsing)
    const output = scanResult.stdout;
    const threatsDetected = (output.match(/THREAT/g) || []).length;
    const warnings = (output.match(/WARNING/g) || []).length;

    return NextResponse.json({
      success: true,
      scanComplete: true,
      summary: {
        threatsDetected,
        warnings,
        scanTime: new Date().toISOString()
      },
      output: output.substring(0, 10000) // Limit output size
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorCode = error instanceof Error && 'code' in error ? (error as any).code : undefined;
    console.error("Security scan failed:", error);
    return NextResponse.json(
      { 
        error: "Security scan failed", 
        details: errorMessage,
        code: errorCode 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check if agent-drift is available
    let driftInstalled = false;
    try {
      await execAsync("agent-drift --version", { timeout: 5000 });
      driftInstalled = true;
    } catch {
      // Not installed
    }

    return NextResponse.json({
      driftInstalled,
      status: driftInstalled ? "ready" : "not_installed",
      message: driftInstalled 
        ? "Agent-Drift is installed and ready" 
        : "Install with: pip install agent-drift-detector"
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      driftInstalled: false,
      status: "error",
      error: errorMessage
    });
  }
}
