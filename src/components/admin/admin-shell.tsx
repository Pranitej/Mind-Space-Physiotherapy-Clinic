import { Globe } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { BrandLogoMark } from "@/components/layout/brand-wordmark";
import { siteConfig } from "@/config/site.config";
import { ADMIN_HOME_PATH } from "@/lib/admin/display";
import { LogoutButton } from "./logout-button";

/**
 * Chrome for signed-in admin pages. Deliberately not the marketing header and
 * footer: no booking CTA or WhatsApp button, just orientation and sign out.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#admin-main"
        className="sr-only z-50 rounded-lg bg-surface px-4 py-3 font-semibold text-primary shadow focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <header className="border-b border-border bg-surface">
        <Container className="flex h-16 max-w-7xl items-center justify-between gap-3">
          <Link
            href={ADMIN_HOME_PATH}
            className="flex min-h-11 min-w-0 items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 sm:gap-2.5"
          >
            <BrandLogoMark className="size-8 sm:size-9" />
            <span className="text-lg leading-tight font-semibold tracking-[-0.01em] whitespace-nowrap text-primary">
              <span className="md:hidden">{siteConfig.shortName}</span>
              <span className="hidden md:inline">{siteConfig.name}</span>
            </span>
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold tracking-wide text-primary uppercase">
              Admin
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className={buttonClasses({ variant: "ghost", size: "sm", className: "h-11 px-3" })}
            >
              <Globe aria-hidden="true" className="size-4" />
              <span className="sr-only md:not-sr-only">View website</span>
            </Link>
            <LogoutButton />
          </div>
        </Container>
      </header>

      <main id="admin-main" tabIndex={-1} className="flex-1 py-8 focus:outline-none sm:py-10">
        <Container className="max-w-7xl">{children}</Container>
      </main>
    </>
  );
}
