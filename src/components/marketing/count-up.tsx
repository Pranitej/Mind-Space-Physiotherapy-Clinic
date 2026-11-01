"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 1600;
const NUMBER = /^(\D*)([\d,]+)(.*)$/;

/**
 * Counts a stat such as "8,000+" up from zero when it scrolls into view.
 *
 * The server renders the real value, and it stays that way if the stat is
 * already on screen when the page loads, if motion is reduced, or without
 * JavaScript. Screen readers only ever get the final value.
 */
export function CountUp({ value }: { value: string }) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    const match = NUMBER.exec(value);
    if (!element || !match) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Clearly on screen already: counting from zero now would visibly flash the number away.
    if (element.getBoundingClientRect().top < window.innerHeight * 0.8) return;

    const [, prefix, digits, suffix] = match;
    const target = Number(digits.replace(/,/g, ""));
    const grouped = digits.includes(",");
    const format = (n: number) => `${prefix}${grouped ? n.toLocaleString("en-IN") : String(n)}${suffix}`;

    let frame = 0;
    // Below the fold, so the reset to zero is not seen.
    setDisplay(format(0));

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / DURATION_MS, 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          setDisplay(format(Math.round(target * eased)));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {display}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}
