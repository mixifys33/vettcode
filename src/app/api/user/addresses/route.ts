import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Use server-side env var (no NEXT_PUBLIC_ prefix) with fallback
const BACKEND = process.env.SERVER_URL
  || process.env.NEXT_PUBLIC_SERVER_URL
  || "http://localhost:3000";

function getToken(cookieStore: Awaited<ReturnType<typeof cookies>>, req: NextRequest) {
  return cookieStore.get("access_token")?.value
    || req.headers.get("authorization")?.replace("Bearer ", "")
    || "";
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = getToken(cookieStore, request);

    const res = await fetch(`${BACKEND}/api/user/addresses`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { success: false, addresses: [], error: text }; }

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("[GET /api/user/addresses]", error?.message);
    return NextResponse.json({ success: false, addresses: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = getToken(cookieStore, request);

    if (!token) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();

    const res = await fetch(`${BACKEND}/api/user/addresses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { success: false, error: text }; }

    if (!res.ok) {
      console.error(`[POST /api/user/addresses] Backend ${res.status}:`, text.slice(0, 300));
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("[POST /api/user/addresses]", error?.message);
    return NextResponse.json({ success: false, error: error?.message || "Failed to create address" }, { status: 500 });
  }
}

