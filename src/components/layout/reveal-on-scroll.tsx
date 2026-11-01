"use client";

import { useEffect } from "react";

/**
 * Fallback scroll reveal for browsers without scroll-driven animations (where
 * those exist, globals.css ties [data-reveal] to the scroll position and this
 * does nothing). Rendered by the marketing template, which remounts on every
 * navigation, so each new page is scanned once.
 *
 * Progressive enhancement: the server renders everything visible and only
 * elements still below the fold when this runs are hidden. Nothing flashes,
 * and content stays visible without JavaScript or with reduced motion.
 */
export function RevealOnScroll() {
  useEffect(() => {
    if (CSS.supports("animation-timeline: view()")) return;
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-reveal", "shown");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    const foldLine = window.innerHeight;
    for (const element of document.querySelectorAll('[data-reveal]:not([data-reveal="shown"])')) {
      if (element.getBoundingClientRect().top < foldLine) continue;
      element.setAttribute("data-reveal", "hidden");
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
