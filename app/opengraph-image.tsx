import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const heroData = await readFile(join(process.cwd(), "assets", "og-hero.png"), "base64");
const heroSrc = `data:image/png;base64,${heroData}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 80px",
          color: "#f4f2f6",
          backgroundColor: "#120a24",
          backgroundImage:
            "radial-gradient(circle at 78% 45%, rgba(168, 141, 174, 0.55), rgba(18, 10, 36, 0) 55%), linear-gradient(135deg, #1b1230 0%, #120a24 60%, #2f2234 100%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#c2aec8",
            }}
          >
            Le magazine en ligne
          </div>
          <div style={{ display: "flex", fontSize: 112, fontWeight: 700, lineHeight: 1.05, marginTop: 16 }}>
            {site.name}
          </div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 600, color: "#d8cbdc", marginTop: 12 }}>
            {site.tagline}
          </div>
        </div>
        <img src={heroSrc} alt="" height={560} width={431} />
      </div>
    ),
    size
  );
}
