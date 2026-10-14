import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_DESCRIPTION, BRAND_COLOR } from "@/lib/seo";

export const alt = `${SITE_NAME} — enterprise lead management and sales distribution`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generates the social share card for the public marketing surface.
 * Rendered at build time and referenced automatically via the
 * `opengraph-image` file convention.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0f172a",
          backgroundImage: `radial-gradient(circle at 15% 15%, ${BRAND_COLOR}44 0%, transparent 55%), radial-gradient(circle at 85% 85%, #38bdf855 0%, transparent 55%)`,
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 76,
              height: 76,
              borderRadius: 20,
              backgroundColor: BRAND_COLOR,
              color: "white",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            LF
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: "white",
              letterSpacing: -1,
            }}
          >
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.1,
              letterSpacing: -2,
              maxWidth: 940,
            }}
          >
            Lead Management &amp; Sales Distribution
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#cbd5e1",
              lineHeight: 1.35,
              maxWidth: 900,
            }}
          >
            {SITE_DESCRIPTION}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              backgroundColor: "#1e293b",
              color: "#93c5fd",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            Enterprise Lead Engine
          </div>
        </div>
      </div>
    ),
    size
  );
}
