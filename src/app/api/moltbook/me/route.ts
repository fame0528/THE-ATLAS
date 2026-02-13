import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.MOLTBOOK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "MOLTBOOK_API_KEY not configured" }, { status: 500 });
    }

    const res = await fetch("https://www.moltbook.com/api/v1/agents/me", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Moltbook API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch agent profile", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
