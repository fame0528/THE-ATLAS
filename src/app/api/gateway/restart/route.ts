import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST() {
  try {
    // Attempt to restart the OpenClaw gateway
    // This would typically call the openclaw CLI or system service
    const result = await execAsync("openclaw gateway restart", { 
      timeout: 30000,
      maxBuffer: 1024 * 1024
    });

    return NextResponse.json({
      success: true,
      message: "Gateway restart initiated",
      output: result.stdout
    });
  } catch (error: any) {
    console.error("Gateway restart failed:", error);
    return NextResponse.json(
      { 
        error: "Failed to restart gateway", 
        details: error.message,
        code: error.code 
      },
      { status: 500 }
    );
  }
}
