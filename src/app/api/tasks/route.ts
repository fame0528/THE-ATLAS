import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const workspaceDir = path.join(process.cwd(), "..");
const tasksMdPath = path.join(workspaceDir, "TASKS.md");
const tasksStatePath = path.join(workspaceDir, "memory", "tasks-state.json");

/**
 * Parses TASKS.md into a state object
 */
function parseMdToState() {
  if (!fs.existsSync(tasksMdPath)) return null;
  const content = fs.readFileSync(tasksMdPath, "utf8");
  const lines = content.split("\n");
  const tasks: any[] = [];
  let currentSection = "General";
  let lastMainTask: any = null;

  for (let line of lines) {
    const sectionMatch = line.match(/^##\s+(.*)/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      continue;
    }

    const taskMatch = line.match(/^([-*])\s+\[(x| )\]\s+(.*)/);
    if (taskMatch) {
      const isIndented = line.startsWith("  ") || line.startsWith("\t");
      const checked = taskMatch[2] === "x";
      let text = taskMatch[3].trim();
      const isBold = text.startsWith("**") && text.endsWith("**");
      if (isBold) text = text.slice(2, -2);

      // Using a deterministic ID based on text to maintain stability
      const taskId = text.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30) + "-" + currentSection.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 10);

      const task = {
        id: taskId,
        section: currentSection,
        text,
        checked,
        children: []
      };

      if (isIndented && lastMainTask) {
        lastMainTask.children.push(task);
      } else {
        tasks.push(task);
        lastMainTask = task;
      }
    }
  }

  return {
    version: "1.1.0",
    lastUpdated: new Date().toISOString(),
    tasks
  };
}

/**
 * Generates TASKS.md content from state
 */
function generateMdFromState(state: any) {
  let md = `# TASK LIST — Running Priorities\n\n`;
  md += `Last updated: ${new Date().toISOString().split("T")[0]}\n\n`;

  const sections: Record<string, any[]> = {};
  state.tasks.forEach((t: any) => {
    if (!sections[t.section]) sections[t.section] = [];
    sections[t.section].push(t);
  });

  for (const [section, tasks] of Object.entries(sections)) {
    md += `## ${section}\n\n`;
    tasks.forEach(t => {
      md += `- [${t.checked ? "x" : " "}] ${t.text}\n`;
      if (t.children && t.children.length > 0) {
        t.children.forEach((c: any) => {
          md += `  - [${c.checked ? "x" : " "}] ${c.text}\n`;
        });
      }
    });
    md += `\n`;
  }

  return md;
}

export async function GET() {
  try {
    // TASKS.md is the source of truth
    const state = parseMdToState();
    if (!state) {
      return NextResponse.json({ error: "TASKS.md not found" }, { status: 404 });
    }

    // Save state for persistence/backup
    fs.writeFileSync(tasksStatePath, JSON.stringify(state, null, 2));

    return NextResponse.json(state);
  } catch (error) {
    console.error("Failed to read tasks:", error);
    return NextResponse.json(
      { error: "Failed to read tasks", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId, checked } = body;

    if (typeof taskId !== "string" || typeof checked !== "boolean") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const state = parseMdToState();
    if (!state) return NextResponse.json({ error: "Failed to parse TASKS.md" }, { status: 500 });

    const updateTaskRecursive = (tasks: any[]): boolean => {
      for (const t of tasks) {
        if (t.id === taskId) {
          t.checked = checked;
          return true;
        }
        if (t.children && updateTaskRecursive(t.children)) return true;
      }
      return false;
    };

    if (updateTaskRecursive(state.tasks)) {
      const newMd = generateMdFromState(state);
      fs.writeFileSync(tasksMdPath, newMd);
      fs.writeFileSync(tasksStatePath, JSON.stringify(state, null, 2));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
