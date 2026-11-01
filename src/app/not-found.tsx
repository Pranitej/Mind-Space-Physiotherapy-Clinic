import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site.config";

// Next.js adds `noindex` to not-found responses automatically.
export const metadata: Metadata = { title: "Page not found" };

/**
 * Root 404. It renders inside the root layout only (not the marketing route
 * group's layout), so it brings the public site chrome with it: a visitor who
 * followed a broken link can still navigate, call or book.
 */
export default function NotFound() {
  const { navigation } = siteConfig;
  const suggestions = navigation.main.filter((item) => item.href !== "/");

  return (
    <SiteShell>
      <Container className="py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-[0.14em] text-muted uppercase">Error 404</p>
          <h1 className="mt-4 font-display text-4xl text-primary sm:text-5xl">We couldn’t find that page</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            The link may be out of date, or the page may have moved. These are good places to start:
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href={navigation.cta.href} size="lg">
              {navigation.cta.label}
            </ButtonLink>
            <ButtonLink href="/" variant="outline" size="lg">
              Go to the home page
            </ButtonLink>
          </div>

          <ul className="mt-12 flex flex-wrap justify-center gap-x-8 border-t border-border pt-8">
            {suggestions.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </SiteShell>
  );
}
