import { siteConfig } from "@/config/site.config";
import type { BrandMarkOptions } from "./brand-mark";

/**
 * App icon variants. `app/icon.tsx` serves each one at `/icon/<id>` and
 * `app/manifest.ts` lists them, so both read from this one definition.
 */
export interface AppIconVariant {
  id: string;
  contentType: "image/png";
  size: number;
  mark: BrandMarkOptions;
}

/** Every icon is the white emblem on a brand-colour tile: it stays legible at favicon size. */
const tile = { inverse: true, backgroundColor: siteConfig.theme.colors.primary } as const;

/** Browser-tab favicon, rounded like the tile in the site header. */
export const faviconIcon = {
  id: "64",
  contentType: "image/png",
  size: 64,
  mark: { ...tile, scale: 0.8, cornerRadius: 0.22 },
} as const satisfies AppIconVariant;

/**
 * 192px and 512px PNGs are what Android home screens and Chrome's install UI
 * expect. They are full-bleed with the emblem kept inside the central 80% safe
 * zone, so each file also works as a `maskable` icon.
 */
export const manifestIcons = [192, 512].map(
  (size) =>
    ({
      id: String(size),
      contentType: "image/png",
      size,
      mark: { ...tile, scale: 0.68, cornerRadius: 0 },
    }) as const satisfies AppIconVariant,
);

/** iOS home-screen icon. iOS rounds the corners itself, so it must be full-bleed. */
export const appleTouchIcon = {
  size: 180,
  mark: { ...tile, scale: 0.76, cornerRadius: 0 },
} as const;

export function appIconUrl(variant: Pick<AppIconVariant, "id">): string {
  return `/icon/${variant.id}`;
}
