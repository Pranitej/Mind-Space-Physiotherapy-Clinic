"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ANNOUNCE_DELAY_MS = 800;

function describe(remaining: number): string {
  if (remaining >= 0) return `${remaining} ${remaining === 1 ? "character" : "characters"} remaining`;
  const over = -remaining;
  return `${over} ${over === 1 ? "character" : "characters"} too many`;
}

/**
 * Live character counter. The visible text updates on every keystroke; the
 * screen-reader announcement is debounced and only starts near the limit, so
 * assistive technology is not interrupted on every character typed.
 */
export function CharacterCount({ id, length, max }: { id: string; length: number; max: number }) {
  const remaining = max - length;
  const text = describe(remaining);
  const [announcement, setAnnouncement] = useState("");

  const nearLimit = length > 0 && remaining <= Math.ceil(max * 0.1);
  useEffect(() => {
    if (!nearLimit) return;
    const timer = setTimeout(() => setAnnouncement(text), ANNOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [nearLimit, text]);

  return (
    <>
      <p
        id={id}
        aria-hidden="true"
        className={cn("text-sm tabular-nums", remaining < 0 ? "font-medium text-danger" : "text-muted")}
      >
        {text}
      </p>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </>
  );
}
