import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value
      || request.headers.get("authorization")?.replace("Bearer ", "")
      || "";

    const res = await fetch(`${BACKEND}/api/user/following`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { success: false, following: [] }; }

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("[following-list]", error?.message);
    return NextResponse.json({ success: false, following: [] }, { status: 500 });
  }
}

