import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

/**
 * GET /api/pickup-stations
 * Fetches Link Bus delivery terminals from the backend.
 * If ?sellerIds=id1,id2 is passed, also fetches each seller's delivery zones
 * so we can show relevant pickup options for the user's cart.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerIds = searchParams.get("sellerIds")?.split(",").filter(Boolean) || [];
    const region = searchParams.get("region") || "";
    const district = searchParams.get("district") || "";
    const search = searchParams.get("search") || "";

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Build terminal query params
    const params = new URLSearchParams();
    if (region) params.set("region", region);
    if (district) params.set("district", district);
    if (search) params.set("search", search);

    // Fetch all active terminals from backend
    const termRes = await fetch(
      `${BACKEND}/api/delivery/terminals?${params.toString()}`,
      { headers, cache: "no-store" }
    );

    let terminals: any[] = [];
    if (termRes.ok) {
      const termData = await termRes.json();
      terminals = termData.terminals || [];
    }

    // If sellerIds provided, fetch each seller's delivery options to get their zones + fees
    let sellerDeliveryMap: Record<string, any> = {};
    if (sellerIds.length > 0) {
      const sellerFetches = sellerIds.map((id) =>
        fetch(`${BACKEND}/api/delivery/options/${id}`, { headers, cache: "no-store" })
          .then((r) => r.ok ? r.json() : null)
          .catch(() => null)
      );
      const results = await Promise.all(sellerFetches);
      sellerIds.forEach((id, i) => {
        if (results[i]) sellerDeliveryMap[id] = results[i];
      });
    }

    // Normalise terminals to a consistent shape for the frontend
    const stations = terminals.map((t: any) => ({
      id: t._id || t.id,
      name: t.name,
      address: t.address || "",
      district: t.district || "",
      region: t.region || "",
      city: t.city || "",
      county: t.region || "",
      country: "Worldwide",
      phone: t.phone || "",
      company: t.company || "Link Bus",
      type: t.type || "bus_terminal",
      isActive: t.active !== false,
      deliveryFee: Object.values(sellerDeliveryMap)[0]?.terminals?.[0]?.fee ?? 15000,
      operatingHours: "6:00 AM - 10:00 PM",
    }));

    // Build seller info for display (which sellers ship to these terminals)
    const sellers = Object.entries(sellerDeliveryMap).map(([id, data]: any) => ({
      sellerId: id,
      shopName: data.shopName || "Shop",
      freeDeliveryThreshold: data.freeDeliveryThreshold || 0,
      processingDays: data.processingDays || 1,
      zones: data.zones || [],
    }));

    return NextResponse.json({
      success: true,
      stations,
      sellers,
      total: stations.length,
    });
  } catch (error: any) {
    console.error("[pickup-stations]", error?.message);
    return NextResponse.json({ success: false, stations: [], sellers: [] }, { status: 500 });
  }
}

