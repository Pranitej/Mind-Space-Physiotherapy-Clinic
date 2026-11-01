"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type FocusEvent } from "react";
import { Button, ButtonLink, buttonArrowClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { NavLinks, type NavItem } from "./nav-links";

interface MobileNavProps {
  items: ReadonlyArray<NavItem>;
  cta: NavItem;
}

/** Tailwind's `lg` breakpoint, where the desktop navigation takes over. */
const DESKTOP_MEDIA_QUERY = "(min-width: 64rem)";

/**
 * Disclosure-style menu for small screens: the toggle exposes aria-expanded /
 * aria-controls, Escape closes it and returns focus to the toggle, the page
 * behind does not scroll while it is open, and it closes on navigation or when
 * keyboard focus moves elsewhere on the page.
 *
 * The panel stays mounted and fades/slides between states rather than being
 * toggled with `hidden`, so opening, closing and navigating all animate. While
 * closed it is `inert` (unfocusable and hidden from assistive technology) and
 * `invisible` once its exit transition ends.
 */
export function MobileNav({ items, cta }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // Any route change (link, back/forward) closes the menu. Adjusting state
  // during render avoids a frame where the old menu shows over the new page.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const desktop = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const onBreakpointChange = (event: MediaQueryListEvent) => {
      if (event.matches) close(false);
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpointChange);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpointChange);
    };
  }, [open, close]);

  // Tabbing out of the menu would land on content hidden behind the panel.
  // relatedTarget is null for clicks on non-focusable areas inside the panel,
  // which must not close it.
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (open && next instanceof Node && !event.currentTarget.contains(next)) close(false);
  };

  const iconClasses =
    "absolute inset-0 size-5 transition-[opacity,rotate,scale] duration-300 ease-out-soft motion-reduce:transition-none";

  return (
    <div className="lg:hidden" onBlur={onBlur}>
      <Button
        ref={toggleRef}
        variant="outline"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="group w-11 px-0 hover:translate-y-0"
      >
        <span className="relative size-5">
          <Menu
            aria-hidden="true"
            className={`${iconClasses} group-aria-expanded:scale-75 group-aria-expanded:rotate-90 group-aria-expanded:opacity-0`}
          />
          <X
            aria-hidden="true"
            className={`${iconClasses} scale-75 -rotate-90 opacity-0 group-aria-expanded:scale-100 group-aria-expanded:rotate-0 group-aria-expanded:opacity-100`}
          />
        </span>
        <span className="sr-only">Menu</span>
      </Button>

      <div
        id={panelId}
        data-open={open || undefined}
        inert={!open}
        className={
          "group invisible fixed inset-x-0 top-16 bottom-0 z-40 -translate-y-2 overflow-y-auto overscroll-contain " +
          "border-t border-border bg-background opacity-0 transition-[opacity,transform,visibility] duration-300 " +
          "ease-out-soft data-open:visible data-open:translate-y-0 data-open:opacity-100 " +
          "motion-reduce:translate-y-0 motion-reduce:transition-opacity"
        }
      >
        <Container className="flex min-h-full flex-col py-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
          <nav aria-label="Main">
            <NavLinks items={items} variant="mobile" onNavigate={() => close()} />
          </nav>
          <div
            className={
              "mt-10 translate-y-3 opacity-0 transition-[opacity,transform] delay-0 duration-500 ease-out-soft " +
              "group-data-open:translate-y-0 group-data-open:opacity-100 group-data-open:delay-300 " +
              "motion-reduce:translate-y-0"
            }
          >
            <ButtonLink href={cta.href} size="lg" className="w-full" onClick={() => close()}>
              {cta.label}
              <ArrowRight aria-hidden="true" className={buttonArrowClasses} />
            </ButtonLink>
          </div>
        </Container>
      </div>
    </div>
  );
}
