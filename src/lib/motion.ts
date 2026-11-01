import type { CSSProperties } from "react";

/**
 * Staggers the scroll reveal of items in a list: pass as `style` next to
 * `data-reveal`. Later items finish their reveal a little further up the
 * screen (scroll-driven browsers) or a little later (the transition fallback).
 */
export function revealDelay(index: number, stepMs = 80): CSSProperties {
  return {
    "--reveal-delay": `${index * stepMs}ms`,
    "--reveal-offset": `${(index * stepMs) / 20}vh`,
  } as CSSProperties;
}
