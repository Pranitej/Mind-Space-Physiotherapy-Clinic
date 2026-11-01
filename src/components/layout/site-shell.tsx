import type { ReactNode } from "react";
import { siteConfig } from "@/config/site.config";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { MAIN_CONTENT_ID, SkipLink } from "./skip-link";
import { WhatsAppButton } from "./whatsapp-button";

/**
 * Public-site chrome shared by the marketing layout and the root not-found
 * page (which renders outside any route-group layout).
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      {/* tabIndex lets the skip link move focus (not just scroll) in every browser. */}
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter />
      {siteConfig.features.whatsapp && <WhatsAppButton />}
    </>
  );
}
