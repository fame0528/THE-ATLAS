import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sessionPath = "C:\\Users\\spenc\\.openclaw\\workspace\\SESSION-STATE.md";
    const content = await import("fs").then(fs => fs.readFileSync(sessionPath, "utf-8"));
    
    // Parse markdown to extract Active Tasks section
    const tasksMatch = content.match(/^## Active Tasks \/ Projects[\s\S]*?^(?=##)/m);
    if (!tasksMatch) {
      return NextResponse.json({ projects: [] });
    }

    const tasksSection = tasksMatch[0];
    // Extract checked items with descriptions
    const taskRegex = /- \[x\] ~~(.*?)~~ → (.*?)$/gm;
    const tasks: Array<{ name: string; status: string; notes?: string }> = [];
    let match;
    while ((match = taskRegex.exec(tasksSection)) !== null) {
      tasks.push({
        name: match[1].trim(),
        status: "Completed",
        notes: match[2].trim()
      });
    }

    // Also capture unchecked active items
    const activeRegex = /- \[ \] (.*?)$/gm;
    while ((match = activeRegex.exec(tasksSection)) !== null) {
      const line = match[1].trim();
      if (line && !line.includes("##")) {
        tasks.push({
          name: line,
          status: "Active"
        });
      }
    }

    return NextResponse.json({ projects: tasks });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read projects", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
