import fs from "fs";
import path from "path";

const WORKSPACE_ROOT = "C:\\Users\\spenc\\.openclaw\\workspace";

export function getWorkspacePath(): string {
  return WORKSPACE_ROOT;
}

export function readJsonFile<T>(relativePath: string, fallback: T): T {
  try {
    const fullPath = path.join(WORKSPACE_ROOT, relativePath);
    const content = fs.readFileSync(fullPath, "utf-8");
    return JSON.parse(content) as T;
  } catch (err) {
    console.error(`Failed to read ${relativePath}:`, err);
    return fallback;
  }
}

export function readMarkdownFile(relativePath: string): string {
  try {
    const fullPath = path.join(WORKSPACE_ROOT, relativePath);
    return fs.readFileSync(fullPath, "utf-8");
  } catch (err) {
    console.error(`Failed to read ${relativePath}:`, err);
    return "";
  }
}

export function getDailyNotes(): string[] {
  const memoryDir = path.join(WORKSPACE_ROOT, "memory");
  try {
    const files = fs.readdirSync(memoryDir).filter((f) => f.endsWith(".md") && f.match(/^\d{4}-\d{2}-\d{2}/));
    files.sort().reverse();
    return files.slice(0, 3).map((f) => readMarkdownFile(path.join("memory", f)));
  } catch {
    return [];
  }
}