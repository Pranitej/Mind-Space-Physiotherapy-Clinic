import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { buildDashboardHref } from "@/lib/admin/display";
import type { EnquiryStatus } from "@/lib/enquiries/enquiry.types";
import { cn } from "@/lib/utils";

/**
 * Status filter as plain links (not client state), so a filtered view is a
 * real URL that survives reloads, can be bookmarked and works without JS.
 * Choosing a filter always returns to page 1.
 */
export function StatusFilter({ active }: { active?: EnquiryStatus }) {
  const options = [{ id: undefined, label: "All" }, ...siteConfig.admin.statuses];

  return (
    <nav aria-label="Filter enquiries by status" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-1 rounded-full border border-border bg-surface p-1">
        {options.map((option) => {
          const isActive = option.id === active;
          return (
            <li key={option.id ?? "all"}>
              <Link
                href={buildDashboardHref({ status: option.id })}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted hover:bg-primary-soft hover:text-primary",
                )}
              >
                {option.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
