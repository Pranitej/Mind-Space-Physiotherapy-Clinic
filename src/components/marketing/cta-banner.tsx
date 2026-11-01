import { Phone } from "lucide-react";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site.config";
import { formatIndianPhone } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CtaBannerProps {
  title?: string;
  subtitle?: string;
  cta?: { label: string; href: string };
  className?: string;
}

const defaults = siteConfig.pages.home.ctaBanner;

/**
 * Closing call to action. A light panel rather than a dark one, so the accent
 * "Book" button is the strongest colour on screen.
 */
export function CtaBanner({
  title = defaults.title,
  subtitle = defaults.subtitle,
  cta = defaults.cta,
  className,
}: CtaBannerProps) {
  const { phoneE164 } = siteConfig.contact;

  return (
    <section className={cn("pb-20 lg:pb-28", className)}>
      <Container>
        <div className="relative isolate overflow-hidden rounded-4xl border border-primary/10 bg-primary-soft px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-16">
          <Ripples />
          <div className="max-w-xl">
            <h2 className="font-display text-3xl text-primary sm:text-4xl">{title}</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">{subtitle}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:shrink-0">
            <ButtonLink href={cta.href} size="lg">
              {cta.label}
            </ButtonLink>
            <a href={`tel:${phoneE164}`} className={buttonClasses({ variant: "outline", size: "lg" })}>
              <Phone aria-hidden="true" className="size-4" />
              {formatIndianPhone(phoneE164)}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Concentric rings: a quiet texture behind the copy, never content. */
function Ripples() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 400 400"
      className="pointer-events-none absolute -right-24 -bottom-40 -z-10 size-112 text-primary/10 sm:-right-16"
    >
      {[60, 100, 140, 180].map((r) => (
        <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="currentColor" strokeWidth="1.5" />
      ))}
    </svg>
  );
}
