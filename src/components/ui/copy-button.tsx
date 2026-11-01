"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { buttonClasses } from "./button";

type Status = "idle" | "copied" | "failed";

const RESET_AFTER_MS = 2000;

interface CopyButtonProps {
  value: string;
  /** Accessible name, e.g. "Copy reference". The visible text is just "Copy". */
  label: string;
  className?: string;
}

/**
 * Copies `value` to the clipboard. The icon morphs into a tick and the label
 * reads "Copied" for two seconds; the result is also announced to screen
 * readers. If the clipboard is unavailable it says so, and the text being
 * copied should be selectable (e.g. `select-all`) as a fallback.
 */
export function CopyButton({ value, label, className }: CopyButtonProps) {
  const [status, setStatus] = useState<Status>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setStatus("idle"), RESET_AFTER_MS);
  }

  const copied = status === "copied";
  const iconClasses =
    "absolute inset-0 size-4 transition-[opacity,scale] duration-300 ease-out-soft motion-reduce:transition-none";

  return (
    <>
      <button
        type="button"
        aria-label={label}
        onClick={() => void copy()}
        className={buttonClasses({
          variant: "outline",
          size: "sm",
          className: cn("h-10 min-w-26 px-3.5", className),
        })}
      >
        <span aria-hidden="true" className="relative size-4">
          <Copy className={cn(iconClasses, copied ? "scale-50 opacity-0" : "scale-100 opacity-100")} />
          <Check
            strokeWidth={2.5}
            className={cn(
              iconClasses,
              "text-success",
              copied ? "scale-100 opacity-100" : "scale-50 opacity-0",
            )}
          />
        </span>
        {copied ? "Copied" : status === "failed" ? "Try again" : "Copy"}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied && "Copied to clipboard."}
        {status === "failed" && "Couldn't copy automatically. Select the text and copy it instead."}
      </span>
    </>
  );
}
