import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site.config";
import { brandEmblemDataUri, type BrandMarkOptions } from "./brand-mark";

/** The brand mark as an element for `ImageResponse` (Satori) layouts. */
export function BrandMarkImg({
  size,
  scale = 1,
  cornerRadius = 0,
  inverse = false,
  backgroundColor = siteConfig.theme.colors.background,
}: BrandMarkOptions & { size: number }) {
  const emblemSize = Math.round(size * scale);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: Math.round(size * cornerRadius),
        backgroundColor: backgroundColor ?? "transparent",
      }}
    >
      {/* Satori renders plain <img>; next/image does not apply inside ImageResponse. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={brandEmblemDataUri(inverse)} width={emblemSize} height={emblemSize} alt="" />
    </div>
  );
}

/** Renders the brand mark as a square PNG of `size` pixels. */
export function brandMarkImageResponse(size: number, mark: BrandMarkOptions): ImageResponse {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
      <BrandMarkImg size={size} {...mark} />
    </div>,
    { width: size, height: size },
  );
}
