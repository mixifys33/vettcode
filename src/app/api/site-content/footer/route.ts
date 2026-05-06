import { NextRequest, NextResponse } from "next/server";

// Strip out any placeholder/broken image URLs before sending to client
function sanitizeContent(content: Record<string, unknown> | null) {
  if (!content) return null;
  const BAD_HOSTS = ["example.com", "placeholder.com", "via.placeholder"];
  const sanitize = (val: unknown): unknown => {
    if (typeof val === "string") {
      try {
        const url = new URL(val);
        if (BAD_HOSTS.some(h => url.hostname.includes(h))) return "";
      } catch { /* not a URL */ }
      return val;
    }
    if (Array.isArray(val)) return val.map(sanitize);
    if (val && typeof val === "object") {
      return Object.fromEntries(
        Object.entries(val as Record<string, unknown>).map(([k, v]) => [k, sanitize(v)])
      );
    }
    return val;
  };
  return sanitize(content);
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ success: true, content: null });
}

