"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";

interface AnimatedDetailsProps {
  summary: ReactNode;
  children: ReactNode;
  className?: string;
  summaryClassName?: string;
}

// Opening decelerates gently, so the panel answers the click from the first
// frame without snapping open; its text fades in from the start as it is
// uncovered. (An ease-in start, or a delayed fade, reads as a lag followed by
// a rush.) Closing uses an even ease-in-out.
const OPEN_EASING = "cubic-bezier(0.33, 1, 0.68, 1)";
const CLOSE_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
const OPEN_MS = 440;
const OPEN_FADE_MS = 320;
const CLOSE_MS = 360;

/**
 * A native <details> whose panel glides open and closed. It keeps everything
 * <details> gives for free (keyboard and screen-reader support, find-in-page)
 * and simply toggles without animation when JavaScript is unavailable, the
 * user prefers reduced motion, or the browser opens it itself.
 *
 * Opening grows the panel while its content fades and settles in; closing
 * reverses both. Clicking again mid-animation reverses
 * from the current height, so rapid toggling never jumps.
 */
export function AnimatedDetails({ summary, children, className, summaryClassName }: AnimatedDetailsProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animations = useRef<Animation[]>([]);

  const onSummaryClick = (event: MouseEvent<HTMLElement>) => {
    const details = detailsRef.current;
    const panel = panelRef.current;
    const content = contentRef.current;
    if (!details || !panel || !content || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    event.preventDefault();

    const closing = details.open && details.dataset.state !== "closing";
    // Measured before cancelling, so a reversal starts from where the panel is now.
    const fromHeight = panel.getBoundingClientRect().height;
    const fromOpacity = Number(getComputedStyle(content).opacity);
    for (const animation of animations.current) animation.cancel();

    if (closing) {
      details.dataset.state = "closing";
      const height = panel.animate([{ height: `${fromHeight}px` }, { height: "0px" }], {
        duration: CLOSE_MS,
        easing: CLOSE_EASING,
      });
      const fade = content.animate(
        [
          { opacity: fromOpacity, transform: "translateY(0)" },
          { opacity: 0, transform: "translateY(-0.375rem)" },
        ],
        { duration: CLOSE_MS * 0.7, easing: CLOSE_EASING, fill: "forwards" },
      );
      animations.current = [height, fade];
      height.onfinish = () => {
        details.open = false;
        delete details.dataset.state;
        fade.cancel();
        animations.current = [];
      };
    } else {
      delete details.dataset.state;
      details.open = true;
      const toHeight = panel.getBoundingClientRect().height;
      const height = panel.animate([{ height: `${fromHeight}px` }, { height: `${toHeight}px` }], {
        duration: OPEN_MS,
        easing: OPEN_EASING,
      });
      const fade = content.animate(
        [
          { opacity: fromOpacity === 1 ? 0 : fromOpacity, transform: "translateY(-0.375rem)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: OPEN_FADE_MS, easing: "ease-out" },
      );
      animations.current = [height, fade];
      height.onfinish = () => {
        animations.current = [];
      };
    }
  };

  return (
    <details ref={detailsRef} className={className}>
      <summary onClick={onSummaryClick} className={summaryClassName}>
        {summary}
      </summary>
      <div ref={panelRef} className="overflow-hidden">
        <div ref={contentRef}>{children}</div>
      </div>
    </details>
  );
}
