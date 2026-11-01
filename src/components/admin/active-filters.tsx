import { X } from "lucide-react";
import Link from "next/link";
import { getServiceName } from "@/config/site.config";
import {
  buildDashboardHref,
  getStatusLabel,
  hasActiveFilters,
  type DashboardLinkQuery,
} from "@/lib/admin/display";
import { getPeriodLabel } from "@/lib/admin/filters";

/**
 * One removable chip per active filter, plus "Clear all". Each chip is a link
 * to the same view without that filter, so it works without JavaScript too.
 */
export function ActiveFilters({ query }: { query: DashboardLinkQuery }) {
  if (!hasActiveFilters(query)) return null;

  const { status, q, service, period, sort } = query;
  const chips = [
    status && {
      key: "status",
      label: `Status: ${getStatusLabel(status)}`,
      href: { ...query, status: undefined },
    },
    q && { key: "q", label: `Search: “${q}”`, href: { ...query, q: undefined } },
    service && { key: "service", label: getServiceName(service), href: { ...query, service: undefined } },
    period && {
      key: "period",
      label: `Received: ${getPeriodLabel(period)}`,
      href: { ...query, period: undefined },
    },
  ].filter((chip) => !!chip);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted">Filtered by</span>
      <ul className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <li key={chip.key}>
            <Link
              href={buildDashboardHref({ ...chip.href, page: 1 })}
              className="group inline-flex h-8 max-w-72 items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft/60 py-1 pr-2 pl-3 text-sm font-medium text-primary transition-colors duration-300 hover:border-primary/40 hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <span className="truncate">{chip.label}</span>
              <span className="grid size-5 place-items-center rounded-full transition-colors group-hover:bg-primary/10">
                <X aria-hidden="true" className="size-3.5" />
              </span>
              <span className="sr-only">(remove filter)</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        // Sorting is a preference rather than a filter, so clearing keeps it.
        href={buildDashboardHref({ sort })}
        className="ml-1 inline-flex h-8 items-center rounded-full px-2 text-sm font-semibold text-muted underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Clear all
      </Link>
    </div>
  );
}
