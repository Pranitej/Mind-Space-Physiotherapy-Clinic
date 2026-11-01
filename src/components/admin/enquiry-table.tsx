import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { getInitials } from "@/components/marketing/initials";
import { getServiceName } from "@/config/site.config";
import { buildDashboardHref, type DashboardLinkQuery } from "@/lib/admin/display";
import { DEFAULT_SORT, getSortLabel, type EnquirySort } from "@/lib/admin/filters";
import type { EnquiryDto } from "@/lib/enquiries/enquiry.types";
import { cn } from "@/lib/utils";
import { ContactLinks, DeliverySummary, MessagePreview, PreferredSlot, ReceivedAt } from "./enquiry-fields";
import { Highlight } from "./highlight";
import { StatusSelect } from "./status-select";

interface EnquiryTableProps {
  enquiries: EnquiryDto[];
  query: DashboardLinkQuery;
  caption: string;
}

const cellClasses = "px-4 py-4 align-top";

/**
 * Desktop layout (lg and up): six columns, each answering one question (who,
 * how to reach them, what for, what they said, when, what's next), so nothing
 * needs a horizontal scroll on a laptop screen. Headers that sort are links.
 */
export function EnquiryTable({ enquiries, query, caption }: EnquiryTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
      <div
        role="region"
        aria-label="Enquiries table"
        // Focusable so keyboard users can scroll it on narrower desktop windows.
        tabIndex={0}
        className="overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2"
      >
        <table className="w-full min-w-[62rem] table-fixed border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <colgroup>
            <col className="w-[20%]" />
            <col className="w-[21%]" />
            <col />
            <col />
            <col className="w-32" />
            <col className="w-44" />
          </colgroup>
          <thead className="border-b border-border bg-background/70 text-xs font-semibold tracking-[0.08em] text-muted uppercase">
            <tr>
              <SortableHeader
                label="Patient"
                query={query}
                ascending="name-asc"
                descending="name-desc"
                first="name-asc"
                className="pl-5"
              />
              <th scope="col" className="px-4 py-3.5">
                Contact
              </th>
              <SortableHeader
                label="Service & date"
                query={query}
                ascending="preferred-date"
                first="preferred-date"
              />
              <th scope="col" className="px-4 py-3.5">
                Message
              </th>
              <SortableHeader
                label="Received"
                query={query}
                ascending="oldest"
                descending="newest"
                first="newest"
              />
              <th scope="col" className="py-3.5 pr-5 pl-4">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {enquiries.map((enquiry) => (
              <tr key={enquiry.id} className="transition-colors duration-200 hover:bg-primary-soft/25">
                <th
                  scope="row"
                  className={cn(
                    cellClasses,
                    "relative pl-5 font-normal",
                    // Accent bar: new enquiries still need a call back.
                    enquiry.status === "new" &&
                      "before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-r-full before:bg-accent",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary"
                    >
                      {getInitials(enquiry.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold wrap-break-word text-foreground">
                        <Highlight text={enquiry.name} term={query.q} />
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-muted">
                        <Highlight text={enquiry.reference} term={query.q} />
                      </p>
                    </div>
                  </div>
                </th>
                <td className={cn(cellClasses, "py-3")}>
                  <ContactLinks enquiry={enquiry} term={query.q} compact />
                </td>
                <td className={cellClasses}>
                  <p className="font-medium text-foreground">{getServiceName(enquiry.service)}</p>
                  <div className="mt-1 text-sm text-muted">
                    <PreferredSlot enquiry={enquiry} />
                  </div>
                </td>
                <td className={cn(cellClasses, "text-muted")}>
                  <MessagePreview message={enquiry.message} term={query.q} />
                </td>
                <td className={cellClasses}>
                  <ReceivedAt iso={enquiry.createdAt} stacked />
                </td>
                <td className={cn(cellClasses, "pr-5")}>
                  <StatusSelect
                    enquiryId={enquiry.id}
                    reference={enquiry.reference}
                    status={enquiry.status}
                  />
                  <div className="mt-2">
                    <DeliverySummary notifications={enquiry.notifications} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface SortableHeaderProps {
  label: string;
  query: DashboardLinkQuery;
  ascending: EnquirySort;
  /** Omitted for one-way sorts (preferred date only sorts soonest first). */
  descending?: EnquirySort;
  /** Sort applied on the first click. */
  first: EnquirySort;
  className?: string;
}

/**
 * A column header that sorts the list. Clicking it again reverses the order;
 * a one-way sort switches back to the default instead.
 */
function SortableHeader({ label, query, ascending, descending, first, className }: SortableHeaderProps) {
  const current = query.sort ?? DEFAULT_SORT;
  const direction = current === ascending ? "ascending" : current === descending ? "descending" : undefined;
  const next = !direction ? first : direction === "ascending" ? (descending ?? DEFAULT_SORT) : ascending;
  const DirectionIcon =
    direction === "ascending" ? ArrowUp : direction === "descending" ? ArrowDown : ChevronsUpDown;

  return (
    <th scope="col" aria-sort={direction} className={cn("px-4 py-2", className)}>
      <Link
        href={buildDashboardHref({ ...query, sort: next, page: 1 })}
        className={cn(
          "-mx-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 uppercase transition-colors duration-200",
          "hover:bg-primary-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2",
          direction && "text-primary",
        )}
      >
        {label}
        <DirectionIcon aria-hidden="true" className={cn("size-3.5", !direction && "opacity-50")} />
        <span className="sr-only">, sort by {getSortLabel(next).toLowerCase()}</span>
      </Link>
    </th>
  );
}
