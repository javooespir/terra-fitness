import { ImageResponse } from "next/og";
import { LOGO_BASE64 } from "./_logo-data";

export const runtime = "edge";
export const alt = "Terra Fitness | Training Center Ituzaingó";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #2e2e33 0%, #25252a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "40px",
          position: "relative",
        }}
      >
        {/* Gold radial glow behind logo */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "700px",
            height: "350px",
            background:
              "radial-gradient(ellipse at center, rgba(212,181,0,0.35) 0%, transparent 70%)",
            borderRadius: "50%",
            display: "flex",
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "300px",
            height: "3px",
            background: "#d4b500",
            display: "flex",
          }}
        />

        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_BASE64}
          alt="Terra Fitness"
          width={260}
          height={260}
          style={{ objectFit: "contain", display: "flex" }}
        />

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              color: "#d4b500",
              letterSpacing: "8px",
              textTransform: "uppercase",
              fontWeight: 700,
              display: "flex",
            }}
          >
            Training Center Ituzaingó
          </div>
          <div
            style={{
              fontSize: "18px",
              color: "#888888",
              letterSpacing: "4px",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Musculación · Calistenia · CrossFit · Spinning
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "#444444",
            fontSize: "16px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          terra-fitness.encende.click
        </div>
      </div>
    ),
    { ...size }
  );
}
