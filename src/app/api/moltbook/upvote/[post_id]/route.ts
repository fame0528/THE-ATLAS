import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ post_id: string }> }) {
  try {
    const apiKey = process.env.MOLTBOOK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "MOLTBOOK_API_KEY not configured" }, { status: 500 });
    }

    const { post_id } = await params;

    const res = await fetch(`https://www.moltbook.com/api/v1/posts/${post_id}/upvote`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Moltbook API error: ${res.status} - ${err}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to upvote", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
