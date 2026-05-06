import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("accessToken")?.value || cookieStore.get("access_token")?.value;
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") || cookieToken;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Please login to place an order" },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Items are required" },
        { status: 400 }
      );
    }
    if (!body.shippingAddress) {
      return NextResponse.json(
        { success: false, message: "Shipping address is required" },
        { status: 400 }
      );
    }
    if (!body.paymentMethod) {
      return NextResponse.json(
        { success: false, message: "Payment method is required" },
        { status: 400 }
      );
    }

    // Mirror the frontend flow: POST to /api/orders on the backend
    const res = await fetch(`${BACKEND}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Cookie: `access_token=${token}`,
      },
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.error("[Order Create] Non-JSON response:", await res.text());
      return NextResponse.json(
        { success: false, message: "Order service unavailable. Make sure the backend is running." },
        { status: 503 }
      );
    }

    const data = await res.json();

    if (!res.ok) {
      console.error("[Order Create] Backend error:", data);
      return NextResponse.json(
        { success: false, message: data?.message || data?.error || "Failed to create order" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("[Order Create] Error:", error);

    if (error.code === "ECONNREFUSED" || error.cause?.code === "ECONNREFUSED") {
      return NextResponse.json(
        { success: false, message: "Cannot connect to backend. Make sure the server is running." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

