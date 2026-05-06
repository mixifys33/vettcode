import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "VETTCODE — Verified Codebases for Founders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0d3f4d 0%, #115061 50%, #1a7a8a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-2px",
            marginBottom: 16,
          }}
        >
          VETTCODE
        </div>
        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.85)",
            fontWeight: 500,
            marginBottom: 40,
          }}
        >
          Verified Codebases for Founders
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
          }}
        >
          {["Web Apps", "Mobile Apps", "SaaS", "APIs", "Templates"].map((cat) => (
            <div
              key={cat}
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 12,
                padding: "8px 20px",
                color: "white",
                fontSize: 20,
              }}
            >
              {cat}
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 22,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          vettcode.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}

