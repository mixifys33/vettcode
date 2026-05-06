import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_GATEWAY = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;

    const res = await fetch(`${API_GATEWAY}/api/user/sessions`, {
      headers: {
        Cookie: `access_token=${accessToken}; refresh_token=${refreshToken}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get sessions" },
      { status: 500 }
    );
  }
}

