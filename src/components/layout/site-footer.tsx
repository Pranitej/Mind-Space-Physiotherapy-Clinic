import { ArrowUpRight, Mail, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site.config";
import { formatAddressLines, formatIndianPhone, todayInClinicTimeZone, whatsappUrl } from "@/lib/format";
import { cn } from "@/lib/utils";
import { BrandWordmark } from "./brand-wordmark";
import { OpeningHoursList } from "./opening-hours";

const footerLink =
  "inline-flex min-h-11 items-center gap-2 text-primary-foreground/85 underline-offset-4 transition-colors " +
  "hover:text-primary-foreground hover:underline";

export function SiteFooter() {
  const { contact, navigation, features } = siteConfig;
  // Year in the clinic's time zone, so the footer never disagrees with IST.
  const year = todayInClinicTimeZone().slice(0, 4);

  return (
    <footer className="bg-primary text-primary-foreground">
      <Container className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:py-20">
        <div className="sm:col-span-2 lg:col-span-4 lg:pr-8">
          <BrandWordmark tone="inverse" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-primary-foreground/75">
            {siteConfig.description}
          </p>
        </div>

        <FooterColumn title="Visit us" className="lg:col-span-3">
          <address className="text-sm leading-relaxed text-primary-foreground/85 not-italic">
            {formatAddressLines().map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <a
            href={contact.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(footerLink, "mt-2 text-sm")}
          >
            Get directions
            <ArrowUpRight aria-hidden="true" className="size-4" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </FooterColumn>

        <FooterColumn title="Contact" className="lg:col-span-3">
          <ul className="text-sm">
            <li>
              <a href={`tel:${contact.phoneE164}`} className={footerLink}>
                <Phone aria-hidden="true" className="size-4" />
                {formatIndianPhone(contact.phoneE164)}
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className={cn(footerLink, "break-all")}>
                <Mail aria-hidden="true" className="size-4 shrink-0" />
                {contact.email}
              </a>
            </li>
            {features.whatsapp && (
              <li>
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={footerLink}>
                  <MessageCircle aria-hidden="true" className="size-4" />
                  WhatsApp
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            )}
          </ul>
        </FooterColumn>

        <FooterColumn title="Opening hours" className="lg:col-span-2">
          <OpeningHoursList tone="inverse" />
        </FooterColumn>
      </Container>

      <div className="border-t border-primary-foreground/15">
        <Container className="flex flex-col gap-2 py-4 text-sm lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6">
              {navigation.footer.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={footerLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="py-3 text-primary-foreground/70">
            © {year} {siteConfig.name}. All rights reserved.
          </p>
        </Container>
      </div>

      {features.demoNotice && (
        <div className="bg-primary-hover">
          <Container className="py-3 pr-20 sm:pr-6 lg:pr-8">
            <p className="text-xs leading-relaxed text-primary-foreground/80">
              Demonstration website: {siteConfig.name} and the people shown are fictional.
            </p>
          </Container>
        </div>
      )}
    </footer>
  );
}

function FooterColumn({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <h2 className="font-sans text-xs font-semibold tracking-[0.14em] text-primary-foreground/70 uppercase">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}
