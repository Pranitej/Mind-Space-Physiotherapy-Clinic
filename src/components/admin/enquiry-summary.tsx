import { siteConfig } from "@/config/site.config";
import type { EnquiryStatusCounts } from "@/lib/enquiries/enquiry.types";
import { cn } from "@/lib/utils";
import { statusTones, toneDotClasses } from "./tones";

/** At-a-glance totals: all enquiries, then one card per status from the config. */
export function EnquirySummary({ counts }: { counts: EnquiryStatusCounts }) {
  const cards = [
    { id: "total", label: "Total", value: counts.total, dot: "bg-foreground" },
    ...siteConfig.admin.statuses.map((status) => ({
      id: status.id,
      label: status.label,
      value: counts[status.id],
      dot: toneDotClasses[statusTones[status.id]],
    })),
  ];

  return (
    <section aria-labelledby="enquiry-summary-heading">
      <h2 id="enquiry-summary-heading" className="sr-only">
        Summary
      </h2>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.id}
            className={cn(
              "rounded-xl border border-border bg-surface px-4 py-3",
              card.id === "total" && "col-span-2 sm:col-span-1",
            )}
          >
            <dt className="flex items-center gap-2 text-sm font-medium text-muted">
              <span aria-hidden="true" className={cn("size-2 rounded-full", card.dot)} />
              {card.label}
            </dt>
            <dd className="mt-1 font-display text-3xl text-foreground tabular-nums">{card.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
