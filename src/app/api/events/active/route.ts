import { NextResponse } from "next/server";

const EVENTS_API = process.env.EVENTS_SERVICE_URL || "http://localhost:4001";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${EVENTS_API}/api/events/active/list`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`Events service returned ${res.status}`);
      return NextResponse.json({ success: true, data: [] });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    // Return empty array instead of 500 when events service is unavailable
    console.warn("Events service unavailable:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ success: true, data: [] });
  }
}

