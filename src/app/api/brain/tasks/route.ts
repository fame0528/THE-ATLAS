import { NextRequest, NextResponse } from 'next/server';
import { getWorkspacePath } from '@/lib/workspace';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const TASKS_PATH = join(getWorkspacePath(), 'TASKS.md');

function generateTaskId(text: string, section: string, isChild = false): string {
  const base = text.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30);
  const sec = section.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 20);
  return `${sec}_${base}_${isChild ? 'child' : 'main'}`;
}

function parseTasks(content: string) {
  const lines = content.split('\n');
  const tasks: any[] = [];
  let currentSection = 'General';
  let sectionTasks: any[] = [];

  for (let line of lines) {
    if (line.startsWith('## ')) {
      if (sectionTasks.length > 0) {
        tasks.push(...sectionTasks);
      }
      currentSection = line.replace('## ', '').trim();
      sectionTasks = [];
    } else if (line.trim().startsWith('- [')) {
      const checked = line.includes('[x]');
      const text = line.replace(/^- \[x\] /, '').replace(/^- \[ \] /, '').trim();
      const id = generateTaskId(text, currentSection);
      sectionTasks.push({
        id,
        section: currentSection,
        text,
        checked,
        children: []
      });
    } else if (line.trim().startsWith('  - [')) {
      const checked = line.includes('[x]');
      const text = line.replace(/^  - \[x\] /, '').replace(/^  - \[ \] /, '').trim();
      const parentId = generateTaskId(text, currentSection, true);
      if (sectionTasks.length > 0) {
        const parent = sectionTasks[sectionTasks.length - 1];
        parent.children.push({
          id: parentId,
          section: currentSection,
          text,
          checked,
          parentId: parent.id
        });
      }
    }
  }
  if (sectionTasks.length > 0) {
    tasks.push(...sectionTasks);
  }
  return tasks;
}

function serializeTasks(tasks: any[]): string {
  const lines: string[] = [];
  let currentSection = '';
  for (const task of tasks) {
    if (task.section !== currentSection) {
      currentSection = task.section;
      lines.push(`## ${currentSection}`);
    }
    const checkbox = task.checked ? '[x]' : '[ ]';
    lines.push(`- ${checkbox} ${task.text}`);
    for (const child of task.children || []) {
      const childCheck = child.checked ? '[x]' : '[ ]';
      lines.push(`  - ${childCheck} ${child.text}`);
    }
  }
  return lines.join('\n') + '\n';
}

export async function GET() {
  try {
    const content = await readFile(TASKS_PATH, 'utf-8');
    const tasks = parseTasks(content);
    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read TASKS.md' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { updates } = await request.json(); // Array of { id, checked }
    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: 'updates must be array' }, { status: 400 });
    }

    // Load current tasks
    const content = await readFile(TASKS_PATH, 'utf-8');
    let tasks = parseTasks(content);

    // Apply updates by id
    const updateMap = new Map(updates.map(u => [u.id, u.checked]));
    function apply(task: any) {
      if (updateMap.has(task.id)) {
        task.checked = updateMap.get(task.id);
      }
      for (const child of task.children || []) {
        if (updateMap.has(child.id)) {
          child.checked = updateMap.get(child.id);
        }
      }
    }
    for (const task of tasks) {
      apply(task);
    }

    // Serialize back and write
    const newContent = serializeTasks(tasks);
    await writeFile(TASKS_PATH, newContent, 'utf-8');
    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update TASKS.md' }, { status: 500 });
  }
}
