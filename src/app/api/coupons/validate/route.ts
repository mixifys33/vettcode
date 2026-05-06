import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, total = 0, productId, cartItems = [] } = body;

    if (!code?.trim()) {
      return NextResponse.json({ valid: false, message: "Please enter a coupon code" }, { status: 400 });
    }

    const upperCode = code.trim().toUpperCase();

    // Collect unique seller IDs from cart items
    const sellerIds = [
      ...new Set(
        cartItems
          .map((item: any) => item.shopId || item.sellerId)
          .filter(Boolean)
      ),
    ] as string[];

    if (sellerIds.length === 0) {
      return NextResponse.json({ valid: false, message: "No sellers found in cart" }, { status: 400 });
    }

    // Search each seller's campaigns for a matching active coupon code
    let matched: any = null;

    for (const sellerId of sellerIds) {
      try {
        const res = await fetch(`${BACKEND}/api/campaigns/seller/${sellerId}`, {
          cache: "no-store",
        });
        if (!res.ok) continue;
        const data = await res.json();
        const campaigns: any[] = data.campaigns || [];

        const campaign = campaigns.find(
          (c) =>
            c.couponCode?.toUpperCase() === upperCode &&
            c.status === "active" &&
            new Date(c.startDate) <= new Date() &&
            new Date(c.endDate) >= new Date()
        );

        if (campaign) {
          matched = { campaign, sellerId };
          break;
        }
      } catch {
        continue;
      }
    }

    if (!matched) {
      return NextResponse.json({ valid: false, message: "Invalid or expired coupon code" });
    }

    const { campaign } = matched;

    // Check minimum order amount
    if (campaign.minOrderAmount && total < campaign.minOrderAmount) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order of UGX ${campaign.minOrderAmount.toLocaleString()} required for this coupon`,
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    const baseAmount = productId
      ? cartItems.find((i: any) => i.id === productId)?.price ?? total
      : total;

    if (campaign.discountType === "percentage") {
      discountAmount = Math.round(baseAmount * (campaign.discountValue / 100));
    } else if (campaign.discountType === "fixed") {
      discountAmount = Math.min(campaign.discountValue, baseAmount);
    }

    return NextResponse.json({
      valid: true,
      type: campaign.discountType,
      value: campaign.discountValue,
      discountAmount,
      message: `${campaign.title} — ${
        campaign.discountType === "percentage"
          ? `${campaign.discountValue}% off`
          : `UGX ${campaign.discountValue.toLocaleString()} off`
      }`,
      createdBy: "seller",
      campaignId: campaign._id,
    });
  } catch (error: any) {
    console.error("[Coupon Validate]", error);
    return NextResponse.json(
      { valid: false, message: "Failed to validate coupon. Try again." },
      { status: 500 }
    );
  }
}

