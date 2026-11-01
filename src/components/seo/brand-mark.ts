import { readFileSync } from "node:fs";
import { join } from "node:path";
import { siteConfig } from "@/config/site.config";

/**
 * The brand mark for generated images (favicon, app icons, social card): the
 * clinic's emblem from `siteConfig.logo`, the same artwork as the site header,
 * centred on an optional tile in a theme colour.
 */
export interface BrandMarkOptions {
  /** Size of the emblem relative to the canvas; the rest is padding. */
  scale?: number;
  /** Corner radius as a fraction of the canvas. 0 = full-bleed square (iOS and Android apply their own mask). */
  cornerRadius?: number;
  /** The white emblem, for dark tiles, instead of the teal one. */
  inverse?: boolean;
  /** `null` renders a transparent background. */
  backgroundColor?: string | null;
}

// Read once at module scope: the images that use them are generated at build time.
function readEmblem(publicPath: string): string {
  const file = readFileSync(join(process.cwd(), "public", publicPath));
  return `data:image/png;base64,${file.toString("base64")}`;
}

const emblems = {
  teal: readEmblem(siteConfig.logo.mark),
  white: readEmblem(siteConfig.logo.markInverse),
};

/** The emblem as a PNG data URI, for `<img>` inside `ImageResponse` (Satori) layouts. */
export function brandEmblemDataUri(inverse = false): string {
  return inverse ? emblems.white : emblems.teal;
}
