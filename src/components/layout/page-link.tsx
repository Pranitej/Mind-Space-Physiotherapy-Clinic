"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

type PageLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/**
 * A Link that scrolls back to the top when it points at the page already on
 * screen. Next.js treats that click as a no-op and leaves the scroll position
 * where it was, so "Home" on the home page used to do nothing at all.
 */
export function PageLink({ href, onClick, ...props }: PageLinkProps) {
  const pathname = usePathname();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
    if (event.defaultPrevented || modified || href !== pathname) return;

    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
