import { NextRequest, NextResponse } from 'next/server';
import { getWorkspacePath } from '@/lib/workspace';
import { readFile } from 'fs/promises';
import { join } from 'path';

const FACTS_DIR = join(getWorkspacePath(), 'memory', 'facts');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFilter = searchParams.get('date'); // YYYY-MM-DD
    const category = searchParams.get('category');
    const query = searchParams.get('q'); // keyword search

    // List fact files
    const factsPath = FACTS_DIR;
    let files: string[];
    try {
      files = await readFile(factsPath).then(content => content.split('\n').filter(Boolean));
    } catch {
      // facts dir may be empty
      files = [];
    }

    // If date filter, only look at that file
    if (dateFilter) {
      files = [`facts-${dateFilter}.jsonl`];
    }

    const facts: any[] = [];
    for (const file of files) {
      const filePath = join(factsPath, file);
      try {
        const content = await readFile(filePath, 'utf-8');
        const lines = content.split('\n').filter(Boolean);
        for (const line of lines) {
          const fact = JSON.parse(line);
          // Apply filters
          if (category && fact.category !== category) continue;
          if (query) {
            const searchable = (fact.fact + ' ' + (fact.category || '')).toLowerCase();
            if (!searchable.includes(query.toLowerCase())) continue;
          }
          facts.push({
            id: fact.id || `${file}:${lines.indexOf(line)}`,
            timestamp: fact.timestamp,
            fact: fact.fact,
            category: fact.category,
            source: fact.source,
          });
        }
      } catch (err) {
      }
    }

    // Sort by timestamp descending
    facts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ facts, count: facts.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read facts' }, { status: 500 });
  }
}
