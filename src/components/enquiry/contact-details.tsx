import { ArrowUpRight, Mail, MessageCircle, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { formatHoursRange } from "@/components/layout/opening-hours";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site.config";
import { formatAddressLines, whatsappUrl } from "@/lib/format";
import { revealDelay } from "@/lib/motion";

function NewTabNote() {
  return <span className="sr-only"> (opens in a new tab)</span>;
}

/** Direct alternatives to the form, shown under the contact page heading. */
export function QuickContact() {
  const { contact, features } = siteConfig;
  const whatsappMessage = `Hello ${siteConfig.shortName}, I'd like to book a physiotherapy appointment.`;
  const linkClasses = buttonClasses({ variant: "outline", size: "sm", className: "h-10 px-4" });

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <p className="text-sm text-muted">Prefer to talk?</p>
      <ul className="flex flex-wrap justify-center gap-2">
        <li>
          <a href={`tel:${contact.phoneE164}`} className={linkClasses}>
            <Phone aria-hidden="true" className="size-4" />
            {contact.phone}
          </a>
        </li>
        {features.whatsapp && (
          <li>
            <a
              href={whatsappUrl(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClasses}
            >
              <MessageCircle aria-hidden="true" className="size-4" />
              WhatsApp
              <NewTabNote />
            </a>
          </li>
        )}
        <li>
          <a href={`mailto:${contact.email}`} className={linkClasses}>
            <Mail aria-hidden="true" className="size-4" />
            {contact.email}
          </a>
        </li>
      </ul>
    </div>
  );
}

function InfoColumn({ title, index, children }: { title: string; index: number; children: ReactNode }) {
  return (
    <section data-reveal style={revealDelay(index)}>
      <h2 className="font-sans text-xs font-semibold tracking-[0.16em] text-muted uppercase">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Below the form: where the clinic is, when it is open and what happens after an enquiry. */
export function ClinicInfo() {
  const { contact } = siteConfig;

  return (
    <div className="border-t border-border bg-surface">
      <Container className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16 lg:py-20">
        <InfoColumn title="Visit the clinic" index={0}>
          <address className="leading-relaxed text-foreground not-italic">
            <span className="block font-semibold">{siteConfig.name}</span>
            {formatAddressLines().map((line) => (
              <span key={line} className="block text-muted">
                {line}
              </span>
            ))}
          </address>
          <a
            href={contact.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary underline-offset-4 hover:underline"
          >
            Get directions
            <ArrowUpRight aria-hidden="true" className="size-4" />
            <NewTabNote />
          </a>
        </InfoColumn>

        <InfoColumn title="Opening hours" index={1}>
          <dl className="divide-y divide-border border-y border-border">
            {contact.hours.map((slot) => (
              <div key={slot.label} className="flex items-center justify-between gap-4 py-3">
                <dt className="text-muted">{slot.label}</dt>
                <dd className="font-semibold text-foreground tabular-nums">{formatHoursRange(slot)}</dd>
              </div>
            ))}
          </dl>
        </InfoColumn>

        <InfoColumn title="What happens next" index={2}>
          <ol className="flex flex-col gap-4">
            {siteConfig.pages.home.process.steps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary"
                >
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-foreground">{step.title}</p>
                  <p className="text-sm leading-relaxed text-muted">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </InfoColumn>
      </Container>
    </div>
  );
}
