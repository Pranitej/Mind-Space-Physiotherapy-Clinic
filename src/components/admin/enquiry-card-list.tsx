import type { ReactNode } from "react";
import { getInitials } from "@/components/marketing/initials";
import { getServiceName } from "@/config/site.config";
import type { EnquiryDto } from "@/lib/enquiries/enquiry.types";
import { cn } from "@/lib/utils";
import { ContactLinks, DeliveryBadges, MessagePreview, PreferredSlot, ReceivedAt } from "./enquiry-fields";
import { Highlight } from "./highlight";
import { StatusSelect } from "./status-select";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-x-3 py-2.5">
      <dt className="pt-0.5 text-xs font-semibold tracking-wide text-muted uppercase">{label}</dt>
      <dd className="min-w-0 text-sm">{children}</dd>
    </div>
  );
}

/** Phone and tablet layout (below lg): one card per enquiry, two columns from md. */
export function EnquiryCardList({ enquiries, term }: { enquiries: EnquiryDto[]; term?: string }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {enquiries.map((enquiry) => {
        const headingId = `enquiry-${enquiry.id}`;
        return (
          <li key={enquiry.id}>
            <article
              aria-labelledby={headingId}
              className={cn(
                "relative h-full overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-soft",
                // Accent edge: new enquiries still need a call back.
                enquiry.status === "new" &&
                  "before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-accent",
              )}
            >
              <header className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary"
                >
                  {getInitials(enquiry.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <h3
                    id={headingId}
                    className="font-sans text-base font-semibold wrap-break-word text-foreground"
                  >
                    <Highlight text={enquiry.name} term={term} />
                  </h3>
                  <p className="font-mono text-xs text-muted">
                    <Highlight text={enquiry.reference} term={term} />
                  </p>
                </div>
              </header>

              <dl className="mt-3 divide-y divide-border border-t border-border">
                <Field label="Received">
                  <ReceivedAt iso={enquiry.createdAt} />
                </Field>
                <Field label="Service">{getServiceName(enquiry.service)}</Field>
                <Field label="Preferred">
                  <PreferredSlot enquiry={enquiry} />
                </Field>
                <Field label="Contact">
                  <ContactLinks enquiry={enquiry} term={term} />
                </Field>
                <Field label="Message">
                  <MessagePreview message={enquiry.message} term={term} />
                </Field>
                <Field label="Emails">
                  <DeliveryBadges notifications={enquiry.notifications} />
                </Field>
                <Field label="Status">
                  <StatusSelect
                    enquiryId={enquiry.id}
                    reference={enquiry.reference}
                    status={enquiry.status}
                  />
                </Field>
              </dl>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
