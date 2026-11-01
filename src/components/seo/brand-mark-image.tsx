import { ImageResponse } from "next/og";
import { brandMarkDataUri, type BrandMarkOptions } from "./brand-mark";

/** The brand mark as an element for `ImageResponse` (Satori) layouts. */
export function BrandMarkImg({ size, ...mark }: BrandMarkOptions & { size: number }) {
  // Satori renders plain <img>; next/image does not apply inside ImageResponse.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={brandMarkDataUri(mark)} width={size} height={size} alt="" />;
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
