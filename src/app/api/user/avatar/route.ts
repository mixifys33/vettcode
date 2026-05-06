import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_GATEWAY = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;
    
    // Get the raw request body without parsing it
    const formData = await request.formData();
    
    // Create a new FormData to forward
    const forwardFormData = new FormData();
    for (const [key, value] of formData.entries()) {
      forwardFormData.append(key, value);
    }

    console.log('[Avatar Upload] Forwarding to:', `${API_GATEWAY}/api/user/avatar`);

    const res = await fetch(`${API_GATEWAY}/api/user/avatar`, {
      method: "POST",
      headers: {
        Cookie: `access_token=${accessToken}; refresh_token=${refreshToken}`,
        // Don't set Content-Type - let fetch set it with boundary
      },
      body: forwardFormData,
    });

    console.log('[Avatar Upload] Response status:', res.status);

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("[Avatar Upload] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload avatar" },
      { status: 500 }
    );
  }
}

