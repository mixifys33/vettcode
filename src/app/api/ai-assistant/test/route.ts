import { NextResponse } from "next/server";

// Simple GET test endpoint
export async function GET() {
  console.log("[E-AI Test] GET /api/ai-assistant/test HIT!");
  
  return NextResponse.json({
    success: true,
    message: "E-AI API is working!",
    timestamp: new Date().toISOString(),
    env: {
      hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
      keyLength: process.env.OPENROUTER_API_KEY?.length || 0,
      hasSerpApiKey: !!process.env.SERPAPI_KEY,
      serverUrl: process.env.NEXT_PUBLIC_SERVER_URL || "not set",
    }
  });
}

