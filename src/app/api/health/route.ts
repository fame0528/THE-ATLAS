import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'agent-dashboard'
    },
    { status: 200 }
  );
}
