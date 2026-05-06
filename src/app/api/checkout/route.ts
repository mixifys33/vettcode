import { NextResponse } from "next/server";

const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ORDER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "http://localhost:5770";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cart, user, shippingAddress, billingAddress, paymentMethod = "card", paymentGateway = "flutterwave", currency = "UGX" } = body || {};

    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400 });
    }

    if (!user?.id) {
      return NextResponse.json({ success: false, message: "User authentication required" }, { status: 401 });
    }

    const items = cart.map((item: any) => ({
      productId: item.id,
      productName: item.title || item.name || "Unknown Product",
      productImage: item.images?.[0]?.url || item.image || "",
      variantId: item.selectedOptions?.variantId,
      shopId: item.shopId || item.shop?.id || "unknown",
      quantity: Number(item.quantity) || 1,
      price: Number(item.sale_price) || Number(item.price) || 0,
      discount: Number(item.discount) || 0,
    }));

    const payload = {
      userId: user?.id,
      items,
      shippingAddress: shippingAddress || {
        fullName: user?.name || "Guest",
        phone: user?.phone || "N/A",
        addressLine1: "Update shipping address",
        city: "",
        country: "UG",
      },
      billingAddress: billingAddress,
      currency,
      paymentMethod,
      paymentGateway,
    };

    console.log("[Checkout] Calling order service:", `${ORDER_SERVICE_URL}/api/orders/create`);
    console.log("[Checkout] Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${ORDER_SERVICE_URL}/api/orders/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      console.error("[Checkout] Non-JSON response from order service:", text);
      return NextResponse.json({ 
        success: false, 
        message: "Order service unavailable. Please ensure the order service is running on port 5770." 
      }, { status: 503 });
    }

    const data = await response.json();
    
    if (!response.ok) {
      console.error("[Checkout] Order service error:", data);
      return NextResponse.json({ 
        success: false, 
        message: data?.message || data?.error || "Failed to create order" 
      }, { status: response.status });
    }

    console.log("[Checkout] Order created successfully");
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[Checkout] Error:", error);
    
    // Check if it's a connection error
    if (error.code === "ECONNREFUSED" || error.cause?.code === "ECONNREFUSED") {
      return NextResponse.json({ 
        success: false, 
        message: "Cannot connect to order service. Please ensure the order service is running on port 5770." 
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: error?.message || "Checkout failed. Please try again." 
    }, { status: 500 });
  }
}

