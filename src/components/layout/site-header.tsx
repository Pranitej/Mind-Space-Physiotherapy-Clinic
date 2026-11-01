import { Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site.config";
import { formatIndianPhone } from "@/lib/format";
import { BrandWordmark } from "./brand-wordmark";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";

export function SiteHeader() {
  const { navigation, contact } = siteConfig;
  const phone = { href: `tel:${contact.phoneE164}`, label: formatIndianPhone(contact.phoneE164) };

  return (
    <header className="sticky top-0 z-40 border-b border-border">
      {/*
        The translucent blur lives on its own layer: a backdrop-filter on the
        header itself would become the containing block of the mobile menu's
        fixed-position panel and clip it to the header's height.
      */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-background/90 backdrop-blur-md" />
      <Container className="flex h-16 items-center justify-between gap-4 lg:h-18">
        <BrandWordmark />

        <nav aria-label="Main" className="hidden lg:block">
          <NavLinks items={navigation.main} />
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={phone.href}
            aria-label={`Call ${phone.label}`}
            className={
              "hidden h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold " +
              "text-primary transition-colors hover:bg-primary-soft lg:inline-flex"
            }
          >
            <Phone aria-hidden="true" className="size-4" />
            <span className="hidden xl:inline">{phone.label}</span>
          </a>
          <ButtonLink href={navigation.cta.href} className="hidden sm:inline-flex">
            {navigation.cta.label}
          </ButtonLink>
          <MobileNav items={navigation.main} cta={navigation.cta} phone={phone} />
        </div>
      </Container>
    </header>
  );
}
