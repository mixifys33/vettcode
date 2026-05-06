import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

/**
 * POST /api/product-chat
 * Proxies to backend POST /api/ai/chat
 *
 * Web sends:  { message, productInfo, chatHistory }
 * Backend expects: { messages: [{isBot, text}], product: {...} }
 * Backend returns: { success, reply, relatedProducts? }
 * Web returns:     { success, message, similarProducts }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, productInfo, chatHistory = [] } = body;

    if (!message) {
      return NextResponse.json({ success: false, message: "Message is required" }, { status: 400 });
    }

    if (!productInfo) {
      return NextResponse.json({ success: false, message: "Product context is required" }, { status: 400 });
    }

    // Convert chatHistory [{role,content}] → backend format [{isBot, text}]
    const messages = [
      ...(chatHistory as { role: string; content: string }[]).slice(-6).map((m) => ({
        isBot: m.role === "assistant",
        text: m.content,
      })),
      { isBot: false, text: message },
    ];

    // Map web product shape → backend product shape
    const product = {
      id: productInfo.id,
      _id: productInfo.id,
      name: productInfo.title,
      title: productInfo.title,
      price: productInfo.sale_price,
      originalPrice: productInfo.regular_price,
      category: productInfo.category,
      subCategory: productInfo.subCategory,
      brand: productInfo.brand,
      stock: productInfo.stock,
      description: productInfo.description,
      cashOnDelivery: productInfo.cash_on_delivery,
      warranty: productInfo.warranty,
      colors: productInfo.colors || [],
      sizes: productInfo.sizes || [],
      seller: productInfo.shops
        ? { name: productInfo.shops.name, verified: true }
        : undefined,
    };

    const backendRes = await fetch(`${BACKEND}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, product }),
    });

    if (!backendRes.ok) {
      const err = await backendRes.text();
      console.error("[product-chat] backend error:", backendRes.status, err.slice(0, 200));
      return NextResponse.json(
        { success: false, message: "AI service temporarily unavailable. Please try again." },
        { status: 502 }
      );
    }

    const data = await backendRes.json();

    // Normalise relatedProducts from backend shape → web shape
    const similarProducts = (data.relatedProducts || []).map((p: any) => ({
      id: p._id || p.id,
      title: p.title,
      slug: p.slug || p._id || p.id,
      price: p.salePrice || p.price,
      image: p.image || p.images?.[0]?.url || "",
      rating: p.rating || 0,
      brand: p.brand || "",
      stock: p.stock || 0,
    }));

    return NextResponse.json({
      success: true,
      message: data.reply || "",
      similarProducts,
    });
  } catch (error: any) {
    console.error("[product-chat] error:", error?.message);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

