import { NextRequest, NextResponse } from 'next/server';
import { getWorkspacePath } from '@/lib/workspace';
import { db, getDocumentById, updateDocument, deleteDocument } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = getDocumentById(parseInt(id));
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    return NextResponse.json({ document: doc });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load document' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, url, description, category, tags } = body;
    const result = updateDocument(parseInt(id), { title, url, description, category, tags });
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Document not found or no changes' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = deleteDocument(parseInt(id));
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
