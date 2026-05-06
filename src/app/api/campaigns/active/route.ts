import { NextResponse } from "next/server";

const BACKEND = process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/campaigns/active`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    console.error("[campaigns/active]", e?.message);
    return NextResponse.json({ success: false, campaigns: [] }, { status: 500 });
  }
}

