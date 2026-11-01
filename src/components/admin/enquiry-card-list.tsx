import type { ReactNode } from "react";
import { getServiceName } from "@/config/site.config";
import type { EnquiryDto } from "@/lib/enquiries/enquiry.types";
import { ContactLinks, DeliveryBadges, MessagePreview, PreferredSlot, ReceivedAt } from "./enquiry-fields";
import { StatusSelect } from "./status-select";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-x-3 py-2">
      <dt className="pt-0.5 text-xs font-semibold tracking-wide text-muted uppercase">{label}</dt>
      <dd className="min-w-0 text-sm">{children}</dd>
    </div>
  );
}

/** Mobile layout (below md): one card per enquiry instead of a wide table. */
export function EnquiryCardList({ enquiries }: { enquiries: EnquiryDto[] }) {
  return (
    <ul className="space-y-3">
      {enquiries.map((enquiry) => {
        const headingId = `enquiry-${enquiry.id}`;
        return (
          <li key={enquiry.id}>
            <article aria-labelledby={headingId} className="rounded-xl border border-border bg-surface p-4">
              <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 id={headingId} className="font-sans text-base font-semibold text-foreground">
                  {enquiry.name}
                </h3>
                <span className="font-mono text-xs text-muted">{enquiry.reference}</span>
              </header>

              <dl className="mt-2 divide-y divide-border">
                <Field label="Received">
                  <ReceivedAt iso={enquiry.createdAt} />
                </Field>
                <Field label="Service">{getServiceName(enquiry.service)}</Field>
                <Field label="Preferred">
                  <PreferredSlot enquiry={enquiry} />
                </Field>
                <Field label="Contact">
                  <ContactLinks enquiry={enquiry} />
                </Field>
                <Field label="Message">
                  <MessagePreview message={enquiry.message} />
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
