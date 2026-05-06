import { NextRequest, NextResponse } from "next/server";

const EVENTS_API = process.env.EVENTS_SERVICE_URL || "http://localhost:4001/api/events";

export async function POST(request: NextRequest) {
  try {
    const { eventId, action, productId, userId } = await request.json();

    if (!eventId || !action) {
      return NextResponse.json(
        { success: false, message: "eventId and action required" },
        { status: 400 }
      );
    }

    // Track based on action type
    let endpoint = "";
    let body: any = { eventId };

    switch (action) {
      case "view":
        endpoint = "/integration/track/view";
        body.userId = userId;
        break;
      case "add_to_cart":
        endpoint = "/integration/track/add-to-cart";
        body.productId = productId;
        body.userId = userId;
        break;
      case "purchase":
        endpoint = "/integration/track/sale";
        body.productId = productId;
        body.userId = userId;
        break;
      default:
        return NextResponse.json({ success: true }); // Ignore unknown actions
    }

    // Fire and forget - don't wait for response
    fetch(`${EVENTS_API}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Event tracking error:", error);
    return NextResponse.json({ success: true }); // Don't fail on tracking errors
  }
}

