import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ post_id: string }> }
) {
  try {
    const apiKey = process.env.MOLTBOOK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "MOLTBOOK_API_KEY not configured" }, { status: 500 });
    }

    const { post_id } = await params;
    const { content, parent_id } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const body: any = { content };
    if (parent_id) {
      body.parent_id = parent_id;
    }

    const res = await fetch(`https://www.moltbook.com/api/v1/posts/${post_id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Moltbook API error: ${res.status} - ${err}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to comment", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
