import { ImageResponse } from "next/og";
import { BrandMarkImg } from "@/components/seo/brand-mark-image";
import { defaultOgImage } from "@/components/seo/og-image";
import { siteConfig } from "@/config/site.config";

export const alt = defaultOgImage.alt;
export const size = { width: defaultOgImage.width, height: defaultOgImage.height };
export const contentType = defaultOgImage.type;

const { colors } = siteConfig.theme;
const { locality, city } = siteConfig.contact.address;

/**
 * Social sharing card (WhatsApp, LinkedIn, X, ...). Uses the font bundled with
 * next/og, so generating it needs no network access.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: colors.background,
        color: colors.foreground,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "80px 72px 64px" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
          <div style={{ fontSize: 26, letterSpacing: 3, textTransform: "uppercase", color: colors.accent }}>
            {siteConfig.tagline}
          </div>
          <div style={{ marginTop: 20, fontSize: 88, lineHeight: 1.04, color: colors.primary }}>
            {siteConfig.name}
          </div>
          <div style={{ marginTop: 28, fontSize: 36, color: colors.muted }}>{`${locality}, ${city}`}</div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 28,
            borderTop: `2px solid ${colors.border}`,
            fontSize: 28,
          }}
        >
          <div style={{ display: "flex" }}>{siteConfig.contact.phone}</div>
          <div style={{ display: "flex", color: colors.muted }}>{`Since ${siteConfig.foundedYear}`}</div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 380,
          backgroundColor: colors.primary,
        }}
      >
        <BrandMarkImg size={260} inverse backgroundColor={null} />
      </div>
    </div>,
    size,
  );
}
