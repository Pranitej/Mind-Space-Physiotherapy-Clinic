import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site.config";
import { BrandWordmark } from "./brand-wordmark";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";

/**
 * Three things only: the logo, the pages and one booking action. Phone,
 * WhatsApp and address live in the footer, the contact page and the floating
 * WhatsApp button, where they don't compete with navigation.
 */
export function SiteHeader() {
  const { navigation } = siteConfig;

  return (
    <header className="sticky top-0 z-40">
      {/*
        The translucent blur lives on its own layer: a backdrop-filter on the
        header itself would become the containing block of the mobile menu's
        fixed-position panel and clip it to the header's height.
      */}
      <div
        aria-hidden="true"
        className="header-surface absolute inset-0 -z-10 border-b border-border bg-background/85 shadow-soft backdrop-blur-xl"
      />
      <Container className="flex h-16 items-center justify-between gap-6 lg:grid lg:h-18 lg:grid-cols-[1fr_auto_1fr]">
        <BrandWordmark className="justify-self-start" />

        <nav aria-label="Main" className="hidden lg:block">
          <NavLinks items={navigation.main} />
        </nav>

        <div className="flex items-center justify-end gap-2">
          <ButtonLink href={navigation.cta.href} size="sm" className="hidden h-10 px-5 sm:inline-flex">
            {navigation.cta.label}
          </ButtonLink>
          <MobileNav items={navigation.main} cta={navigation.cta} />
        </div>
      </Container>
    </header>
  );
}
