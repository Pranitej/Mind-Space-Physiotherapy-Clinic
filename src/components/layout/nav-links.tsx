"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
}

interface NavLinksProps {
  items: ReadonlyArray<NavItem>;
  variant?: "desktop" | "mobile";
  /** Called when a link is activated, e.g. so the mobile menu can close itself. */
  onNavigate?: () => void;
}

const variantStyles = {
  desktop: {
    list: "flex items-center gap-1",
    link:
      "inline-flex h-11 items-center rounded-full px-4 text-[0.95rem] font-medium text-foreground/80 " +
      "transition-colors hover:bg-primary-soft hover:text-primary",
    active: "bg-primary-soft text-primary",
  },
  mobile: {
    list: "flex flex-col",
    link:
      "flex min-h-16 items-center justify-between gap-4 border-b border-border py-3 font-display text-2xl " +
      "text-primary transition-colors hover:text-primary-hover",
    active: "font-semibold",
  },
} as const;

/**
 * Main navigation links with the current page marked via aria-current. This is
 * the only part of the header that needs the pathname, so it is the client leaf.
 */
export function NavLinks({ items, variant = "desktop", onNavigate }: NavLinksProps) {
  const pathname = usePathname();
  const styles = variantStyles[variant];

  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={cn(styles.link, active && styles.active)}
            >
              {item.label}
              {variant === "mobile" && active && (
                <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-primary" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
