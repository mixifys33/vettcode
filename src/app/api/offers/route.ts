import { NextRequest, NextResponse } from "next/server";

const API_GATEWAY = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";
    const category = searchParams.get("category") || "";
    const sortBy = searchParams.get("sortBy") || "discount";

    // Fetch active offers from product service via API gateway
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(category && { category }),
      sortBy,
    });

    const res = await fetch(
      `${API_GATEWAY}/product/api/offers/public/active?${queryParams}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await res.json();

    if (!data.success) {
      return NextResponse.json({ success: true, offers: [], total: 0 });
    }

    // Transform offers data for frontend
    const transformedOffers = (data.offers || []).map((offer: any) => ({
      id: offer.id,
      title: offer.title,
      description: offer.description,
      slug: offer.slug,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      maxDiscountAmount: offer.maxDiscountAmount,
      startDate: offer.startDate,
      endDate: offer.endDate,
      timeRemaining: offer.timeRemaining,
      isFlashDeal: offer.isFlashDeal,
      isLimitedStock: offer.isLimitedStock,
      requiresCode: offer.requiresCode,
      shopId: offer.shopId,
      products: (offer.products || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        sale_price: p.sale_price,
        regular_price: p.regular_price,
        image: p.images?.[0]?.url || null,
        category: p.category,
        discountedPrice: calculateDiscountedPrice(
          p.sale_price,
          offer.discountType,
          offer.discountValue,
          offer.maxDiscountAmount
        ),
      })),
    }));

    return NextResponse.json({
      success: true,
      offers: transformedOffers,
      total: data.pagination?.total || transformedOffers.length,
      pagination: data.pagination,
    });
  } catch (error: any) {
    console.error("Failed to fetch offers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch offers",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

function calculateDiscountedPrice(
  price: number,
  discountType: string,
  discountValue: number,
  maxDiscountAmount?: number
): number {
  if (!price || !discountValue) return price;

  let discount = 0;

  if (discountType === "Percentage") {
    discount = (price * discountValue) / 100;
    if (maxDiscountAmount && discount > maxDiscountAmount) {
      discount = maxDiscountAmount;
    }
  } else if (discountType === "FixedAmount") {
    discount = discountValue;
  }

  return Math.max(0, Math.round(price - discount));
}

