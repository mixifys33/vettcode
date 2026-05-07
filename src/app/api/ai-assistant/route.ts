import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

/** Decode JWT payload without verifying signature (verification happens on backend) */
function decodeJwtUserId(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    // Backend signs with { id, userId, _id, sub } — try all common fields
    return decoded.id || decoded.userId || decoded._id || decoded.sub || null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, chatHistory = [], userId: clientUserId, cart } = body;

    if (!message) {
      return NextResponse.json({ success: false, message: "Message is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value
      || cookieStore.get("token")?.value
      || req.headers.get("authorization")?.replace("Bearer ", "");

    // Prefer token-decoded userId (authoritative) over client-sent userId
    const tokenUserId = token ? decodeJwtUserId(token) : null;
    const userId = tokenUserId || clientUserId || null;

    const messages = [
      ...(chatHistory as { role: string; content: string }[]).slice(-14),
      { role: "user", content: message },
    ];

    const userContext = {
      userId,
      cartCount: Array.isArray(cart) ? cart.length : 0,
      isLoggedIn: !!userId,
    };

    const backendRes = await fetch(`${BACKEND}/api/vettcode-ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ messages, userContext }),
    });

    if (!backendRes.ok) {
      const err = await backendRes.text();
      console.error("[ai-assistant] backend error:", backendRes.status, err.slice(0, 200));
      return NextResponse.json(
        { success: false, message: "AI service temporarily unavailable. Please try again." },
        { status: 502 }
      );
    }

    const data = await backendRes.json();

    const productRecommendations = (data.products || []).map((p: any) => ({
      id: p.id,
      title: p.name || p.title,
      slug: p.slug || p.id,
      price: p.price,
      regularPrice: p.originalPrice || p.price,
      image: p.image || "",
      rating: p.rating || 0,
      stock: p.stock || 0,
      brand: p.brand || "",
      category: p.category || "",
    }));

    return NextResponse.json({
      success: true,
      message: data.reply || "",
      productRecommendations,
      orders: data.orders || [],
      suggestions: data.suggestions || [],
    });
  } catch (error: any) {
    console.error("[ai-assistant] error:", error?.message);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

