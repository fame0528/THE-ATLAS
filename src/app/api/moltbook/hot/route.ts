import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.MOLTBOOK_API_KEY;
    const authHeader = apiKey ? `Bearer ${apiKey}` : undefined;

    const res = await fetch("https://www.moltbook.com/api/v1/posts?sort=hot&limit=10", {
      headers: {
        Accept: "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    if (!res.ok) {
      throw new Error(`Moltbook API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch Moltbook", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
