import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_GATEWAY = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";

    let url = `${API_GATEWAY}/order/user?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;

    const res = await fetch(url, {
      headers: {
        Cookie: `access_token=${accessToken}; refresh_token=${refreshToken}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get orders" },
      { status: 500 }
    );
  }
}

