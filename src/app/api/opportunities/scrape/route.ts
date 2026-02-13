import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Fetch Moltbook hot posts directly
    const apiKey = process.env.MOLTBOOK_API_KEY;
    const authHeader = apiKey ? `Bearer ${apiKey}` : undefined;

    const res = await fetch("https://www.moltbook.com/api/v1/posts?sort=hot&limit=20", {
      headers: {
        Accept: "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    if (!res.ok) {
      throw new Error(`Moltbook API error: ${res.status}`);
    }

    const data = await res.json();
    const posts = data.posts || [];

    // Normalize and grade
    const opportunities = posts.map(post => {
      const netKarma = (post.upvotes || 0) - (post.downvotes || 0);
      const score = netKarma * 1.2; // recency boost for hot posts

      return {
        source: 'moltbook',
        source_id: post.id,
        title: post.title,
        url: `https://www.moltbook.com/posts/${post.id}`,
        description: post.content || '',
        score: Math.min(1000, Math.round(score)),
        star_count: netKarma,
        tags: JSON.stringify(post.tags || []),
        category: post.submolt?.display_name || null,
        posted_at: post.created_at || null,
        scraped_at: new Date().toISOString()
      };
    });

    // Insert into DB
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO opportunities 
      (source, source_id, title, url, description, score, star_count, tags, category, posted_at, scraped_at)
      VALUES (@source, @source_id, @title, @url, @description, @score, @star_count, @tags, @category, @posted_at, @scraped_at)
    `);

    let count = 0;
    for (const opp of opportunities) {
      stmt.run(opp);
      count++;
    }

    const total = db.prepare('SELECT COUNT(*) as total FROM opportunities').get().total;

    return NextResponse.json({ 
      success: true, 
      inserted: count, 
      total: total 
    });
  } catch (error) {
    console.error('Scrape failed:', error);
    return NextResponse.json(
      { error: 'Scrape failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
