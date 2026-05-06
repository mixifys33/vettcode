import { NextResponse } from "next/server";

export async function GET() {
  // VAPID public key should be set in environment variables
  const publicKey = process.env.VAPID_PUBLIC_KEY || "";

  return NextResponse.json({ publicKey });
}

