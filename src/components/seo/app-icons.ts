import type { BrandMarkOptions } from "./brand-mark";

/**
 * App icon variants. `app/icon.tsx` serves each one at `/icon/<id>` and
 * `app/manifest.ts` lists them, so both read from this one definition.
 */
export interface AppIconVariant {
  id: string;
  contentType: "image/svg+xml" | "image/png";
  /** Pixel size; omitted for the SVG, which scales to any size. */
  size?: number;
  mark: BrandMarkOptions;
}

/** Browser-tab favicon: crisp at every pixel density, a few hundred bytes. */
export const faviconIcon = {
  id: "svg",
  contentType: "image/svg+xml",
  mark: { scale: 1.12, cornerRadius: 0.22 },
} as const satisfies AppIconVariant;

/**
 * 192px and 512px PNGs are what Android home screens and Chrome's install UI
 * expect. They are full-bleed with the mark kept inside the central 80% safe
 * zone, so each file also works as a `maskable` icon.
 */
export const manifestIcons = [192, 512].map(
  (size) =>
    ({
      id: String(size),
      contentType: "image/png",
      size,
      mark: { scale: 0.8, cornerRadius: 0 },
    }) as const satisfies AppIconVariant,
);

/** iOS home-screen icon. iOS rounds the corners itself, so it must be full-bleed. */
export const appleTouchIcon = {
  size: 180,
  mark: { scale: 0.92, cornerRadius: 0 },
} as const;

export function appIconUrl(variant: Pick<AppIconVariant, "id">): string {
  return `/icon/${variant.id}`;
}
