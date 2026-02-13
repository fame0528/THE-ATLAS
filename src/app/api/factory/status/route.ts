import { NextRequest, NextResponse } from 'next/server';
import { getContentFactoryState } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agent = searchParams.get('agent'); // optional: research, script, thumbnail
    const state = getContentFactoryState(agent || undefined);
    return NextResponse.json({ factory: state });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get factory state' }, { status: 500 });
  }
}
