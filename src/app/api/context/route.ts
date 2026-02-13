import { NextResponse } from "next/server";

export async function GET() {
  try {
    const memoryDir = "C:\\Users\\spenc\\.openclaw\\workspace\\memory";
    const fs = await import("fs");
    const path = await import("path");
    
    // List all dated memory files, sort by name descending (newest first)
    const files = fs.readdirSync(memoryDir)
      .filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.md$/))
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 3); // last 3 days

    const contexts = files.map(file => {
      const date = file.replace(".md", "");
      const content = fs.readFileSync(path.join(memoryDir, file), "utf-8");
      // Extract first paragraph or a summary line
      const lines = content.split("\n").filter(l => l.trim() && !l.startsWith("#"));
      const preview = lines.slice(0, 3).join(" ").substring(0, 200) + "...";
      return {
        date,
        preview,
        file: path.join(memoryDir, file)
      };
    });

    return NextResponse.json({ contexts });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read context", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
