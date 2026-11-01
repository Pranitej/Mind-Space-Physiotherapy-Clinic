"use client";

import { Menu, Phone, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type FocusEvent } from "react";
import { Button, ButtonLink, buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { NavLinks, type NavItem } from "./nav-links";

interface MobileNavProps {
  items: ReadonlyArray<NavItem>;
  cta: NavItem;
  phone: { href: string; label: string };
}

/** Tailwind's `lg` breakpoint, where the desktop navigation takes over. */
const DESKTOP_MEDIA_QUERY = "(min-width: 64rem)";

/**
 * Disclosure-style menu for small screens: the toggle exposes aria-expanded /
 * aria-controls, Escape closes it and returns focus to the toggle, the page
 * behind does not scroll while it is open, and it closes on navigation or when
 * keyboard focus moves elsewhere on the page.
 */
export function MobileNav({ items, cta, phone }: MobileNavProps) {
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

  return (
    <div className="lg:hidden" onBlur={onBlur}>
      <Button
        ref={toggleRef}
        variant="outline"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="w-11 px-0"
      >
        {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
        <span className="sr-only">Menu</span>
      </Button>

      <div
        id={panelId}
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto overscroll-contain border-t border-border bg-background"
      >
        <Container className="py-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
          <nav aria-label="Main">
            <NavLinks items={items} variant="mobile" onNavigate={() => close()} />
          </nav>
          <div className="mt-8 grid gap-3">
            <ButtonLink href={cta.href} size="lg" onClick={() => close()}>
              {cta.label}
            </ButtonLink>
            <a href={phone.href} className={buttonClasses({ variant: "outline", size: "lg" })}>
              <Phone aria-hidden="true" className="size-4" />
              Call {phone.label}
            </a>
          </div>
        </Container>
      </div>
    </div>
  );
}
