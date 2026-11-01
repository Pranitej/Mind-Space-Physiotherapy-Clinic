import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ActiveFilters } from "@/components/admin/active-filters";
import { EmptyState } from "@/components/admin/empty-state";
import { EnquiryCardList } from "@/components/admin/enquiry-card-list";
import { EnquirySummary } from "@/components/admin/enquiry-summary";
import { EnquiryTable } from "@/components/admin/enquiry-table";
import { EnquiryToolbar } from "@/components/admin/enquiry-toolbar";
import { ErrorPanel } from "@/components/admin/error-panel";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Pagination } from "@/components/admin/pagination";
import { RefreshButton } from "@/components/admin/refresh-button";
import {
  buildDashboardHref,
  describeResults,
  getClinicTimeZoneName,
  getPageRange,
  getStatusLabel,
  hasActiveFilters,
} from "@/lib/admin/display";
import { getSortLabel } from "@/lib/admin/filters";
import { parseDashboardSearchParams, type DashboardQuery } from "@/lib/admin/schemas";
import { requireAdminPage } from "@/lib/auth/dal";
import { countEnquiriesByStatus, listEnquiries } from "@/lib/enquiries/enquiry.repository";
import type { EnquiryPage, EnquiryStatusCounts } from "@/lib/enquiries/enquiry.types";
import { logger } from "@/lib/logger";

export const metadata: Metadata = {
  title: "Enquiries",
};

type DashboardData = { ok: true; enquiries: EnquiryPage; counts: EnquiryStatusCounts } | { ok: false };

/** A database failure becomes an inline panel (and a log entry) instead of a crashed page. */
async function loadDashboardData({ q, ...query }: DashboardQuery): Promise<DashboardData> {
  try {
    const [enquiries, counts] = await Promise.all([
      listEnquiries({ ...query, search: q }),
      countEnquiriesByStatus(),
    ]);
    return { ok: true, enquiries, counts };
  } catch (error) {
    // The search text is left out of the log: it can contain a patient's name or number.
    logger.error("admin.dashboard_load_failed", { error, page: query.page, status: query.status });
    return { ok: false };
  }
}

export default async function AdminDashboardPage({ searchParams }: PageProps<"/admin">) {
  // First, before touching any data: the proxy's redirect is only an optimisation.
  await requireAdminPage();

  const query = parseDashboardSearchParams(await searchParams);
  const data = await loadDashboardData(query);

  // Past the end, e.g. the only row on the last page just changed status out of this filter.
  if (data.ok && data.enquiries.total > 0 && query.page > data.enquiries.pageCount) {
    redirect(buildDashboardHref({ ...query, page: data.enquiries.pageCount }));
  }

  return (
    <>
      <AdminPageHeader
        title="Enquiries"
        description={`Appointment requests from the website. Times are ${getClinicTimeZoneName()}.`}
      />
      {data.ok ? (
        <DashboardContent query={query} enquiries={data.enquiries} counts={data.counts} />
      ) : (
        <ErrorPanel
          title="Enquiries couldn't be loaded"
          message="The database didn't respond. Nothing has been lost. Please try again in a moment."
          action={<RefreshButton />}
        />
      )}
    </>
  );
}

interface DashboardContentProps {
  query: DashboardQuery;
  enquiries: EnquiryPage;
  counts: EnquiryStatusCounts;
}

function DashboardContent({ query, enquiries, counts }: DashboardContentProps) {
  const { items, page, pageCount, pageSize, total } = enquiries;
  const statusLabel = query.status ? getStatusLabel(query.status) : undefined;
  const summary = describeResults({ ...getPageRange({ page, pageSize, total }), total, statusLabel });
  const filtered = hasActiveFilters(query);

  return (
    <div className="space-y-6">
      <EnquirySummary counts={counts} query={query} />

      <section aria-labelledby="enquiry-list-heading" className="space-y-4">
        <h2 id="enquiry-list-heading" className="sr-only">
          Enquiry list
        </h2>

        <EnquiryToolbar query={query} />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <ActiveFilters query={query} />
          {/* Announces the new result count after a search, filter or page change. */}
          <p aria-live="polite" className="text-sm font-medium text-muted tabular-nums lg:ml-auto">
            {summary}
            {total > 0 && <span className="text-muted/80"> · {getSortLabel(query.sort)}</span>}
          </p>
        </div>

        {items.length === 0 ? (
          <EmptyState
            title={filtered ? "No enquiries match" : "No enquiries yet"}
            description={
              filtered
                ? "Try a different search, or remove a filter to see more enquiries."
                : "New enquiries from the website's booking form will appear here as soon as they arrive."
            }
            action={
              filtered
                ? { label: "Clear search and filters", href: buildDashboardHref({ sort: query.sort }) }
                : undefined
            }
          />
        ) : (
          <>
            <div className="hidden lg:block">
              <EnquiryTable
                enquiries={items}
                query={query}
                caption={`${summary}, ${getSortLabel(query.sort).toLowerCase()}. Page ${page} of ${pageCount}.`}
              />
            </div>
            <div className="lg:hidden">
              <EnquiryCardList enquiries={items} term={query.q} />
            </div>
            <Pagination page={page} pageCount={pageCount} query={query} />
          </>
        )}
      </section>
    </div>
  );
}
