import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL || process.env.SERVER_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get("transaction_id");
    const txRef = searchParams.get("tx_ref");
    const status = searchParams.get("status");

    if (!transactionId && !txRef) {
      return NextResponse.json(
        { success: false, message: "Transaction ID or reference is required" },
        { status: 400 }
      );
    }

    // Verify with backend
    const endpoint = transactionId
      ? `/api/flutterwave/verify/${transactionId}`
      : `/api/flutterwave/verify-ref/${txRef}`;

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: result.message || "Verification failed" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      verified: result.verified,
      transaction: result.transaction,
      order: result.order,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, message: "Verification failed", error: error.message },
      { status: 500 }
    );
  }
}
