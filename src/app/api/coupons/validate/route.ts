import { NextRequest, NextResponse } from "next/server";
import { resolveSellerId } from "@/utils/sellerId";

const BACKEND =
  process.env.SERVER_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "https://easyshop-d00e.onrender.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, total = 0, applicationId, productId, cartItems = [] } = body;

    if (!code?.trim()) {
      return NextResponse.json(
        { valid: false, message: "Please enter a coupon code" },
        { status: 200 }
      );
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { valid: false, message: "Add an application to your cart before applying a coupon" },
        { status: 200 }
      );
    }

    const res = await fetch(`${BACKEND}/api/campaigns/validate-coupon`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        code: String(code).trim(),
        total,
        applicationId: applicationId || productId,
        cartItems: cartItems.map((item: Record<string, unknown>) => {
          const seller = resolveSellerId(item);
          return {
            id: item.id ?? item.productId,
            shopId: seller,
            sellerId: seller,
            price: Number(item.price) || 0,
            appCategory: item.appCategory,
          };
        }),
      }),
    });

    let data: Record<string, unknown> = { valid: false, message: "Could not validate coupon" };

    try {
      data = await res.json();
    } catch {
      return NextResponse.json(
        { valid: false, message: "Coupon service unavailable. Try again in a moment." },
        { status: 200 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          valid: false,
          message:
            (data.message as string) ||
            (res.status >= 500
              ? "Coupon service is temporarily unavailable. Please try again."
              : "Could not validate coupon"),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    console.error("[Coupon Validate]", error);
    return NextResponse.json(
      { valid: false, message: "Failed to validate coupon. Try again." },
      { status: 200 }
    );
  }
}
