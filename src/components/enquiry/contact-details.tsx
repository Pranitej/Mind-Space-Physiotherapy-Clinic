import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site.config";
import { formatAddressLines, formatTime, whatsappUrl } from "@/lib/format";

const linkClasses =
  "inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline";

function NewTabNote() {
  return <span className="sr-only"> (opens in a new tab)</span>;
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-6">
      <h2 className="font-display text-xl text-primary">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ContactRow({
  icon: IconComponent,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <IconComponent aria-hidden="true" className="size-4" />
      </span>
      <div>
        <p className="text-sm text-muted">{label}</p>
        {children}
      </div>
    </li>
  );
}

/** Sidebar on the contact page: direct contact options, location, hours and next steps. */
export function ContactDetails() {
  const { contact, features } = siteConfig;
  const whatsappMessage = `Hello ${siteConfig.shortName}, I'd like to book a physiotherapy appointment.`;

  return (
    <aside aria-label="Contact details" className="flex flex-col gap-6">
      <Card title="Prefer to talk?">
        <ul className="flex flex-col gap-3">
          <ContactRow icon={Phone} label="Call us">
            <a href={`tel:${contact.phoneE164}`} className={linkClasses}>
              {contact.phone}
            </a>
          </ContactRow>
          {features.whatsapp && (
            <ContactRow icon={MessageCircle} label="WhatsApp">
              <a
                href={whatsappUrl(whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClasses}
              >
                Message us on WhatsApp
                <NewTabNote />
              </a>
            </ContactRow>
          )}
          <ContactRow icon={Mail} label="Email">
            <a href={`mailto:${contact.email}`} className={`${linkClasses} break-all`}>
              {contact.email}
            </a>
          </ContactRow>
        </ul>
      </Card>

      <Card title="Visit the clinic">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <MapPin aria-hidden="true" className="size-4" />
          </span>
          <div>
            <address className="leading-relaxed text-foreground not-italic">
              <span className="block font-semibold">{siteConfig.name}</span>
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
              className={`${linkClasses} gap-2`}
            >
              <Navigation aria-hidden="true" className="size-4" />
              Get directions
              <NewTabNote />
            </a>
          </div>
        </div>
      </Card>

      <Card title="Opening hours">
        <dl className="flex flex-col gap-2">
          {contact.hours.map((slot) => (
            <div key={slot.label} className="flex items-center justify-between gap-4">
              <dt className="flex items-center gap-2 text-foreground">
                <Clock aria-hidden="true" className="size-4 text-muted" />
                {slot.label}
              </dt>
              <dd className="font-semibold text-foreground tabular-nums">
                <time dateTime={slot.opens}>{formatTime(slot.opens)}</time>
                {" – "}
                <time dateTime={slot.closes}>{formatTime(slot.closes)}</time>
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card title="What happens next">
        <ol className="flex flex-col gap-4">
          {siteConfig.pages.home.process.steps.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
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
      </Card>
    </aside>
  );
}
