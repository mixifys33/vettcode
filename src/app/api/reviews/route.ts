import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL;

// GET reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_URL}/api/reviews?productId=${productId}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: true, reviews: [], stats: { average: 0, total: 0, distribution: {} } }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: true, reviews: [], stats: { average: 0, total: 0, distribution: {} } }
    );
  }
}

// POST a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userId, orderId, rating, title, review, images } = body;

    if (!productId || !userId || !orderId || !rating) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, userId, orderId, rating, title, review, images }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { success: false, message: error.message || "Failed to submit review" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, review: data.review });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit review" },
      { status: 500 }
    );
  }
}

