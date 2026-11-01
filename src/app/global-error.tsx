"use client";

import type { CSSProperties } from "react";
import { Button, buttonClasses } from "@/components/ui/button";
import { siteConfig } from "@/config/site.config";
import { formatIndianPhone } from "@/lib/format";
import { themeCssVariables } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { fontDisplay, fontSans } from "./fonts";
import "./globals.css";

interface GlobalErrorProps {
  error: unknown;
  retry: () => void;
}

/*
 * This page replaces the root layout when the layout itself fails, so the
 * <style> tag that defines the --brand-* theme variables is missing. They are
 * set as inline custom properties instead: the CSP allows style attributes,
 * and without them the shared tokens (including the focus ring) would resolve
 * to nothing.
 */
const themeVariables = themeCssVariables() as CSSProperties;

export default function GlobalError({ retry }: GlobalErrorProps) {
  const { phoneE164 } = siteConfig.contact;

  return (
    <html
      lang={siteConfig.locale.htmlLang}
      className={cn(fontSans.variable, fontDisplay.variable)}
      style={themeVariables}
    >
      <body className="flex min-h-dvh items-center justify-center bg-background p-6 font-sans text-foreground antialiased">
        <title>{`Something went wrong | ${siteConfig.name}`}</title>
        <main className="max-w-lg text-center">
          <p className="font-semibold text-primary">{siteConfig.name}</p>
          <h1 className="mt-4 font-display text-4xl text-primary">Something went wrong</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Sorry, the website couldn’t load. Please try again, or call us on{" "}
            <a href={`tel:${phoneE164}`} className="font-semibold text-primary underline underline-offset-4">
              {formatIndianPhone(phoneE164)}
            </a>
            .
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="secondary" size="lg" onClick={retry}>
              Try again
            </Button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the app shell itself failed, so force a full page load instead of client navigation */}
            <a href="/" className={buttonClasses({ variant: "outline", size: "lg" })}>
              Home page
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
