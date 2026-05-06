import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value
      || request.headers.get("authorization")?.replace("Bearer ", "")
      || "";
    const body = await request.json();

    const res = await fetch(`${BACKEND}/api/user/follow-shop`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

