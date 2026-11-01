import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { buildDashboardHref, type DashboardLinkQuery } from "@/lib/admin/display";
import type { EnquiryStatusCounts } from "@/lib/enquiries/enquiry.types";
import { cn } from "@/lib/utils";
import { statusTones, toneDotClasses } from "./tones";

/**
 * Totals per status that double as the status filter: each card is a link
 * (a real, bookmarkable URL that works without JavaScript) which keeps the
 * current search and filters and returns to page 1.
 */
export function EnquirySummary({
  counts,
  query,
}: {
  counts: EnquiryStatusCounts;
  query: DashboardLinkQuery;
}) {
  const cards = [
    { id: undefined, label: "All enquiries", value: counts.total, dot: "bg-foreground", hint: undefined },
    ...siteConfig.admin.statuses.map((status) => ({
      id: status.id,
      label: status.label,
      value: counts[status.id],
      dot: toneDotClasses[statusTones[status.id]],
      hint: status.id === "new" && counts.new > 0 ? "Waiting for a call back" : undefined,
    })),
  ];

  return (
    <nav aria-label="Filter by status">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {cards.map((card) => {
          const isActive = card.id === query.status;
          return (
            <li
              key={card.id ?? "all"}
              className={cn(card.id === undefined && "col-span-2 sm:col-span-4 md:col-span-1")}
            >
              <Link
                href={buildDashboardHref({ ...query, status: card.id, page: 1 })}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col rounded-2xl border bg-surface px-5 py-4 shadow-soft",
                  "transition-[border-color,box-shadow,transform,background-color] duration-300 ease-smooth",
                  "hover:-translate-y-0.5 hover:border-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2",
                  isActive ? "border-primary bg-primary-soft/40 ring-4 ring-primary/10" : "border-border",
                )}
              >
                <span className="flex items-center gap-2 text-sm font-medium text-muted">
                  <span aria-hidden="true" className={cn("size-2 rounded-full", card.dot)} />
                  {card.label}
                </span>
                <span className="mt-2 text-3xl font-semibold tracking-tight text-foreground tabular-nums">
                  {card.value}
                </span>
                {card.hint && <span className="mt-1 text-xs font-medium text-accent">{card.hint}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
