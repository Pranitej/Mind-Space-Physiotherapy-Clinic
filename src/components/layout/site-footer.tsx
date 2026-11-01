import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site.config";
import { formatAddressLines, formatIndianPhone, todayInClinicTimeZone, whatsappUrl } from "@/lib/format";
import { BrandWordmark } from "./brand-wordmark";
import { formatHoursRange } from "./opening-hours";

const footerLink =
  "inline-flex min-h-10 items-center gap-1.5 text-primary-foreground/80 underline-offset-4 transition-colors " +
  "duration-200 hover:text-primary-foreground hover:underline";

/**
 * Brand and one booking action on top; pages, contact and visiting details in
 * three short columns; legal line at the bottom.
 */
export function SiteFooter() {
  const { contact, navigation, features } = siteConfig;
  // Year in the clinic's time zone, so the footer never disagrees with IST.
  const year = todayInClinicTimeZone().slice(0, 4);

  return (
    <footer className="bg-primary text-primary-foreground">
      <Container className="py-16 lg:py-20">
        <div className="flex flex-col gap-8 border-b border-primary-foreground/10 pb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md">
            <BrandWordmark tone="inverse" />
            <p className="mt-5 text-sm leading-relaxed text-primary-foreground/70">
              {siteConfig.description}
            </p>
          </div>
          <ButtonLink href={navigation.cta.href} className="self-start lg:self-auto">
            {navigation.cta.label}
          </ButtonLink>
        </div>

        <div className="grid gap-10 pt-12 text-sm sm:grid-cols-3 lg:gap-16">
          <FooterColumn title="Explore">
            <nav aria-label="Footer">
              <ul>
                {navigation.footer.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={footerLink}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </FooterColumn>

          <FooterColumn title="Contact">
            <ul>
              <li>
                <a href={`tel:${contact.phoneE164}`} className={footerLink}>
                  {formatIndianPhone(contact.phoneE164)}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className={`${footerLink} break-all`}>
                  {contact.email}
                </a>
              </li>
              {features.whatsapp && (
                <li>
                  <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={footerLink}>
                    WhatsApp
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              )}
            </ul>
          </FooterColumn>

          <FooterColumn title="Visit">
            <address className="leading-relaxed text-primary-foreground/80 not-italic">
              {formatAddressLines().map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <dl className="mt-4 space-y-1">
              {contact.hours.map((entry) => (
                <div key={entry.label} className="flex flex-wrap gap-x-2">
                  <dt className="text-primary-foreground/60">{entry.label}</dt>
                  <dd className="text-primary-foreground/90">{formatHoursRange(entry)}</dd>
                </div>
              ))}
            </dl>
            <a
              href={contact.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${footerLink} mt-2`}
            >
              Get directions
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </FooterColumn>
        </div>
      </Container>

      <div className="border-t border-primary-foreground/10">
        {/* Right padding keeps the text clear of the floating WhatsApp button. */}
        <Container className="flex flex-col gap-1.5 py-6 pr-24 text-xs text-primary-foreground/60 sm:pr-24 lg:flex-row lg:justify-between lg:pr-24">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          {features.demoNotice && (
            <p>Demonstration website: {siteConfig.name} and the people shown are fictional.</p>
          )}
        </Container>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="font-sans text-xs font-semibold tracking-[0.16em] text-primary-foreground/50 uppercase">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}
