import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { buildDashboardHref, type DashboardLinkQuery } from "@/lib/admin/display";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageCount: number;
  /** The current search, filters and sort, kept on every page link. */
  query: DashboardLinkQuery;
}

const controlClasses = buttonClasses({ variant: "outline", size: "sm", className: "h-11 px-4" });

export function Pagination({ page, pageCount, query }: PaginationProps) {
  if (pageCount <= 1) return null;

  const hasPrevious = page > 1;
  const hasNext = page < pageCount;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3">
      {hasPrevious ? (
        <Link href={buildDashboardHref({ ...query, page: page - 1 })} rel="prev" className={controlClasses}>
          <ChevronLeft aria-hidden="true" className="size-4" />
          Previous
        </Link>
      ) : (
        // A disabled-looking span rather than a dead link: nothing to focus, nothing to click.
        <span aria-hidden="true" className={cn(controlClasses, "pointer-events-none opacity-40")}>
          <ChevronLeft className="size-4" />
          Previous
        </span>
      )}

      <p className="text-sm text-muted tabular-nums">
        Page <span className="font-semibold text-foreground">{page}</span> of{" "}
        <span className="font-semibold text-foreground">{pageCount}</span>
      </p>

      {hasNext ? (
        <Link href={buildDashboardHref({ ...query, page: page + 1 })} rel="next" className={controlClasses}>
          Next
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <span aria-hidden="true" className={cn(controlClasses, "pointer-events-none opacity-40")}>
          Next
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
