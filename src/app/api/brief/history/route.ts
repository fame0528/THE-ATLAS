import { NextRequest, NextResponse } from 'next/server';
import { listMorningBriefs } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30');
    const briefs = listMorningBriefs(limit);
    return NextResponse.json({ briefs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list briefs' }, { status: 500 });
  }
}
