import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

/**
 * Fonts are self-hosted by next/font at build time: no request to Google at
 * runtime (privacy + CSP `font-src 'self'`), and no layout shift thanks to
 * automatic size-adjusted fallbacks.
 *
 * Fraunces (soft, humanist serif) for headings gives warmth and credibility;
 * Plus Jakarta Sans keeps body copy clean and highly legible on small screens.
 */
export const fontDisplay = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

export const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});
