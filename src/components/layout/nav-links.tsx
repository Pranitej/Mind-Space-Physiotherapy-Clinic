"use client";

import { usePathname } from "next/navigation";
import { revealDelay } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { PageLink } from "./page-link";

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
    item: "",
    // The underline grows from the left on hover and stays drawn under the current page.
    link:
      "relative inline-flex h-11 items-center px-4 text-[0.95rem] font-medium text-foreground/70 " +
      "transition-colors duration-200 hover:text-primary " +
      "after:absolute after:inset-x-4 after:bottom-2 after:h-px after:origin-left after:scale-x-0 " +
      "after:bg-primary after:transition-transform after:duration-300 after:ease-out-soft hover:after:scale-x-100",
    active: "text-primary after:scale-x-100",
  },
  mobile: {
    list: "flex flex-col",
    // Items slide in one after another when the menu opens (the panel is the `group`).
    item:
      "translate-y-3 opacity-0 transition-[opacity,transform] duration-500 ease-out-soft " +
      "group-data-open:translate-y-0 group-data-open:opacity-100 group-data-open:delay-(--reveal-delay) " +
      "motion-reduce:translate-y-0 motion-reduce:transition-opacity",
    link:
      "flex min-h-16 items-center justify-between gap-4 border-b border-border py-3 font-display text-[1.75rem] " +
      "tracking-tight text-primary/80 transition-colors hover:text-primary",
    active: "text-primary",
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
      {items.map((item, index) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li
            key={item.href}
            className={styles.item}
            style={variant === "mobile" ? revealDelay(index + 1, 50) : undefined}
          >
            <PageLink
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={cn(styles.link, active && styles.active)}
            >
              {item.label}
              {variant === "mobile" && active && (
                <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-accent" />
              )}
            </PageLink>
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
