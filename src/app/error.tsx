"use client";

import { Phone, RotateCcw } from "lucide-react";
import { BrandWordmark } from "@/components/layout/brand-wordmark";
import { MAIN_CONTENT_ID } from "@/components/layout/skip-link";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site.config";
import { formatIndianPhone } from "@/lib/format";

interface ErrorPageProps {
  error: unknown;
  retry: () => void;
}

/**
 * Error boundary for every route below the root layout. In production, errors
 * from Server Components reach the browser as a generic message plus a digest;
 * only the digest is shown, as a reference that matches the server logs.
 */
export default function ErrorPage({ error, retry }: ErrorPageProps) {
  const digest = getDigest(error);
  const { phoneE164 } = siteConfig.contact;

  return (
    <>
      <header className="border-b border-border">
        <Container className="flex h-16 items-center lg:h-18">
          <BrandWordmark />
        </Container>
      </header>
      <main id={MAIN_CONTENT_ID} className="flex flex-1 items-center">
        <Container className="py-20 sm:py-28">
          <div className="mx-auto max-w-xl text-center">
            <h1 className="font-display text-4xl text-primary sm:text-5xl">Something went wrong</h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Sorry, this page didn’t load properly. Please try again. If it keeps happening, call us and
              we’ll help you book.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              {/* retry() re-fetches and re-renders the segment, unlike reset(), which only re-renders. */}
              <Button variant="secondary" size="lg" onClick={retry}>
                <RotateCcw aria-hidden="true" className="size-4" />
                Try again
              </Button>
              <ButtonLink href="/" variant="outline" size="lg">
                Go to the home page
              </ButtonLink>
            </div>
            <p className="mt-8">
              <a
                href={`tel:${phoneE164}`}
                className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline underline-offset-4"
              >
                <Phone aria-hidden="true" className="size-4" />
                {formatIndianPhone(phoneE164)}
              </a>
            </p>
            {digest && (
              <p className="mt-6 text-xs text-muted">
                Reference: <code className="font-mono">{digest}</code>
              </p>
            )}
          </div>
        </Container>
      </main>
    </>
  );
}

function getDigest(error: unknown): string | undefined {
  if (error instanceof Error && "digest" in error && typeof error.digest === "string") return error.digest;
  return undefined;
}
