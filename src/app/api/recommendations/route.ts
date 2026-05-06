import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

/**
 * GET /api/recommendations
 * Proxies to backend GET /api/shop-ai/recommendations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const limit = searchParams.get("limit") || "8";

    const params = new URLSearchParams();
    if (category) params.set("category", category);
    params.set("limit", limit);

    const backendRes = await fetch(
      `${BACKEND}/api/shop-ai/recommendations?${params.toString()}`,
      { cache: "no-store" }
    );

    if (!backendRes.ok) {
      console.error("[recommendations] backend error:", backendRes.status);
      return NextResponse.json({ success: false, recommendations: [] }, { status: 502 });
    }

    const data = await backendRes.json();

    // Normalise backend product cards → web shape
    const recommendations = (data.products || []).map((p: any) => ({
      id: p.id,
      title: p.name || p.title,
      slug: p.slug || p.id,
      sale_price: p.price,
      regular_price: p.originalPrice || p.price,
      images: p.image ? [{ url: p.image }] : [],
      ratings: p.rating || 0,
      stock: p.stock || 0,
      brand: p.brand || "",
      category: p.category || "",
    }));

    return NextResponse.json({ success: true, recommendations });
  } catch (error: any) {
    console.error("[recommendations] error:", error?.message);
    return NextResponse.json({ success: false, recommendations: [] }, { status: 500 });
  }
}

