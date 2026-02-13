import { NextRequest, NextResponse } from 'next/server';
import { getWorkspacePath } from '@/lib/workspace';
import { join } from 'path';
import { db, insertDocument, getDocumentById, updateDocument, deleteDocument, getAllDocuments } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const documents = getAllDocuments();
    return NextResponse.json({ documents });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, url, description, category, tags } = body;
    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL required' }, { status: 400 });
    }
    const result = insertDocument({ title, url, description, category, tags });
    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
