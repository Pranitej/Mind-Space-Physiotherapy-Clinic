import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { ClinicJsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site.config";
import { buildRootMetadata } from "@/lib/seo";
import { themeCssRule } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { fontDisplay, fontSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = buildRootMetadata();

export const viewport: Viewport = {
  themeColor: siteConfig.theme.themeColor,
  colorScheme: "light",
  // Lets env(safe-area-inset-*) report real values on notched phones.
  viewportFit: "cover",
};

const themeCss = themeCssRule();

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Per-request CSP nonce set by src/proxy.ts. Reading it also opts every page
  // into dynamic rendering, which nonce-based CSP requires.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang={siteConfig.locale.htmlLang} className={cn(fontSans.variable, fontDisplay.variable)}>
      <head>
        <style nonce={nonce} dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body className="flex min-h-dvh flex-col bg-background font-sans text-foreground antialiased">
        {children}
        <ClinicJsonLd nonce={nonce} />
      </body>
    </html>
  );
}
