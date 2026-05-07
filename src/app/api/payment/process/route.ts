import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL || process.env.SERVER_URL || "http://localhost:3000";

// Add GET handler for testing
export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: "Payment API endpoint is working. Use POST to process payments.",
    backendUrl: BACKEND_URL
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      paymentMethod,
      paymentGateway,
      amount,
      currency,
      customerEmail,
      customerPhone,
      customerName,
      mobileProvider,
      redirectUrl,
    } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Handle Flutterwave payments
    if (paymentGateway === "flutterwave" || paymentMethod?.startsWith("flutterwave_")) {
      const response = await fetch(`${BACKEND_URL}/api/flutterwave/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          paymentMethod,
          amount,
          currency: currency || "UGX",
          customerEmail,
          customerPhone,
          customerName,
          mobileProvider,
          redirectUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { success: false, message: result.message || "Payment initialization failed" },
          { status: response.status }
        );
      }

      return NextResponse.json({
        success: true,
        paymentLink: result.paymentLink,
        link: result.paymentLink, // Alias for compatibility
        txRef: result.txRef,
        transactionId: result.transactionId,
        message: result.message,
      });
    }

    // Handle other payment methods (cash on delivery, etc.)
    return NextResponse.json({
      success: true,
      message: "Payment method processed",
    });
  } catch (error: any) {
    console.error("Payment processing error:", error);
    return NextResponse.json(
      { success: false, message: "Payment processing failed", error: error.message },
      { status: 500 }
    );
  }
}

