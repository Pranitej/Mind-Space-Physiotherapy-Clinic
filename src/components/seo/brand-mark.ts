import { siteConfig } from "@/config/site.config";

/**
 * The brand mark: an "M" whose inner strokes rise like raised arms around a
 * head, a person mid-stretch. It is defined once, as SVG geometry, so the
 * favicon, app icons and social image always render the identical mark in the
 * colours from `siteConfig.theme`.
 *
 * The geometry lives on a 64-unit square canvas and is optically centred.
 */
const CANVAS = 64;
const MARK_PATH = "M15 46V18l17 18 17-18v28";
const HEAD = { cx: 32, cy: 19.5, r: 5.5 } as const;
const STROKE_WIDTH = 7;

const HEX_COLOUR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export interface BrandMarkOptions {
  /** Size of the mark relative to the canvas; the rest is padding. */
  scale?: number;
  /** Corner radius as a fraction of the canvas. 0 = full-bleed square (iOS and Android apply their own mask). */
  cornerRadius?: number;
  markColor?: string;
  /** `null` renders a transparent background. */
  backgroundColor?: string | null;
}

/** Standalone SVG document for the mark. */
export function renderBrandMarkSvg({
  scale = 1,
  cornerRadius = 0,
  markColor = siteConfig.theme.colors.primary,
  backgroundColor = siteConfig.theme.colors.background,
}: BrandMarkOptions = {}): string {
  // Colours are interpolated into markup that is served from our own origin as
  // image/svg+xml, so only accept plain hex values.
  for (const colour of [markColor, backgroundColor]) {
    if (colour !== null && !HEX_COLOUR.test(colour)) throw new Error(`Invalid brand mark colour: ${colour}`);
  }

  const half = CANVAS / 2;
  const background =
    backgroundColor === null
      ? ""
      : `<rect width="${CANVAS}" height="${CANVAS}" rx="${round(CANVAS * cornerRadius)}" fill="${backgroundColor}"/>`;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}">`,
    background,
    `<g transform="translate(${half} ${half}) scale(${round(scale)}) translate(-${half} -${half})">`,
    `<path d="${MARK_PATH}" fill="none" stroke="${markColor}" stroke-width="${STROKE_WIDTH}" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<circle cx="${HEAD.cx}" cy="${HEAD.cy}" r="${HEAD.r}" fill="${markColor}"/>`,
    `</g>`,
    `</svg>`,
  ].join("");
}

/** The mark as a data URI, for `<img>` inside `ImageResponse` (Satori) layouts. */
export function brandMarkDataUri(options?: BrandMarkOptions): string {
  return `data:image/svg+xml;base64,${btoa(renderBrandMarkSvg(options))}`;
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
