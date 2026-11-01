import { getServiceName } from "@/config/site.config";
import type { EnquiryDto } from "@/lib/enquiries/enquiry.types";
import { ContactLinks, DeliveryBadges, MessagePreview, PreferredSlot, ReceivedAt } from "./enquiry-fields";
import { StatusSelect } from "./status-select";

const columns = [
  "Received",
  "Reference",
  "Patient",
  "Contact",
  "Service",
  "Preferred",
  "Message",
  "Email delivery",
  "Status",
] as const;

/** Desktop layout (md and up). The wrapper scrolls horizontally rather than squashing columns. */
export function EnquiryTable({ enquiries, caption }: { enquiries: EnquiryDto[]; caption: string }) {
  return (
    <div
      role="region"
      aria-label="Enquiries table"
      // Focusable so keyboard users can scroll it when it overflows.
      tabIndex={0}
      className="overflow-x-auto rounded-xl border border-border bg-surface focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <table className="w-full min-w-5xl border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-border bg-background/60 text-xs font-semibold tracking-wide text-muted uppercase">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="px-3 py-3 whitespace-nowrap first:pl-4 last:pr-4">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border align-top">
          {enquiries.map((enquiry) => (
            <tr key={enquiry.id} className="hover:bg-background/50">
              <td className="py-3 pr-3 pl-4">
                <ReceivedAt iso={enquiry.createdAt} />
              </td>
              <th scope="row" className="px-3 py-3 font-mono text-xs font-medium whitespace-nowrap">
                {enquiry.reference}
              </th>
              <td className="px-3 py-3 font-semibold text-foreground">{enquiry.name}</td>
              <td className="px-3 py-1.5">
                <ContactLinks enquiry={enquiry} />
              </td>
              <td className="px-3 py-3">{getServiceName(enquiry.service)}</td>
              <td className="px-3 py-3">
                <PreferredSlot enquiry={enquiry} />
              </td>
              <td className="max-w-64 px-3 py-3">
                <MessagePreview message={enquiry.message} />
              </td>
              <td className="px-3 py-3">
                <DeliveryBadges notifications={enquiry.notifications} />
              </td>
              <td className="py-2 pr-4 pl-3">
                <StatusSelect enquiryId={enquiry.id} reference={enquiry.reference} status={enquiry.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
