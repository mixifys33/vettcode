import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "EshopUG — Uganda's #1 Online Marketplace";
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
          EshopUG
        </div>
        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.85)",
            fontWeight: 500,
            marginBottom: 40,
          }}
        >
          Uganda&apos;s #1 Online Marketplace
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
          }}
        >
          {["Electronics", "Fashion", "Home", "Beauty", "Groceries"].map((cat) => (
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
          eshopug.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
