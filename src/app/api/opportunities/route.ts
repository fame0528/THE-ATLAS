import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface Opportunity {
  id: number;
  source: string;
  title: string;
  url: string;
  description?: string;
  score?: number;
  star_count: number;
  tags: any;
  category?: string;
  posted_at?: string;
  scraped_at?: string;
  created_at: string;
}

interface CountResult {
  total: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Build query parameters
    const source = searchParams.get('source'); // e.g., 'reddit', 'moltbook', 'github'
    const minScore = searchParams.get('minScore') ? parseFloat(searchParams.get('minScore')!) : null;
    const tag = searchParams.get('tag');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 100;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;
    const sortBy = searchParams.get('sortBy') || 'score';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build WHERE conditions
    const conditions: string[] = [];
    const params: any[] = [];

    if (source) {
      conditions.push(`source = ?`);
      params.push(source);
    }
    if (minScore !== null && !isNaN(minScore)) {
      conditions.push(`score >= ?`);
      params.push(minScore);
    }
    if (category) {
      conditions.push(`category = ?`);
      params.push(category);
    }
    if (tag) {
      conditions.push(`json_extract(tags, '$') LIKE ?`);
      params.push(`%"${tag}"%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Build ORDER BY
    const validSortFields = ['score', 'star_count', 'posted_at', 'scraped_at', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'score';
    const orderClause = `${sortField} ${sortOrder === 'asc' ? 'ASC' : 'DESC'}`;

    // Get total count with proper typing
    const countResult = db.prepare(`
      SELECT COUNT(*) as total FROM opportunities ${whereClause}
    `).get(...params) as CountResult;
    const totalCount = countResult.total;

    // Build final query with pagination
    const query = `
      SELECT * FROM opportunities 
      ${whereClause} 
      ORDER BY ${orderClause}
      LIMIT ? OFFSET ?
    `;
    
    const rawResults = db.prepare(query).all(...params, limit, offset) as any[];
    
    // Parse JSON tags if present (handle null/undefined)
    const opportunities: Opportunity[] = rawResults.map((opp: any) => ({
      ...opp,
      tags: opp.tags ? (typeof opp.tags === 'string' ? JSON.parse(opp.tags) : opp.tags) : []
    }));

    return NextResponse.json({
      opportunities,
      total: totalCount,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
      hasMore: (offset + limit) < totalCount
    });
  } catch (error) {
    console.error('Opportunities API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
