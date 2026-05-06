import { NextRequest, NextResponse } from "next/server";

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || "http://localhost:5770";

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentMethod, amount, currency } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Process payment through order-service
    const response = await fetch(`${ORDER_SERVICE_URL}/api/orders/${orderId}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentMethod,
        amount,
        currency: currency || "UGX",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: result.message || "Payment failed" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Payment processing error:", error);
    return NextResponse.json(
      { success: false, message: "Payment processing failed", error: error.message },
      { status: 500 }
    );
  }
}

