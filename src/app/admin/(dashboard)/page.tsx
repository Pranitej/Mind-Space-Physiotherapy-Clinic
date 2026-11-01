import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/admin/empty-state";
import { EnquiryCardList } from "@/components/admin/enquiry-card-list";
import { EnquirySummary } from "@/components/admin/enquiry-summary";
import { EnquiryTable } from "@/components/admin/enquiry-table";
import { ErrorPanel } from "@/components/admin/error-panel";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Pagination } from "@/components/admin/pagination";
import { RefreshButton } from "@/components/admin/refresh-button";
import { StatusFilter } from "@/components/admin/status-filter";
import {
  buildDashboardHref,
  describeResults,
  getClinicTimeZoneName,
  getPageRange,
  getStatusLabel,
} from "@/lib/admin/display";
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
async function loadDashboardData({ page, status }: DashboardQuery): Promise<DashboardData> {
  try {
    const [enquiries, counts] = await Promise.all([
      listEnquiries({ page, status }),
      countEnquiriesByStatus(),
    ]);
    return { ok: true, enquiries, counts };
  } catch (error) {
    logger.error("admin.dashboard_load_failed", { error, page, status });
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
    redirect(buildDashboardHref({ status: query.status, page: data.enquiries.pageCount }));
  }

  return (
    <>
      <AdminPageHeader
        title="Enquiries"
        description={`Appointment requests from the website, newest first. Times are ${getClinicTimeZoneName()}.`}
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

function DashboardContent({ query: { status }, enquiries, counts }: DashboardContentProps) {
  const { items, page, pageCount, pageSize, total } = enquiries;
  const statusLabel = status ? getStatusLabel(status) : undefined;
  const summary = describeResults({ ...getPageRange({ page, pageSize, total }), total, statusLabel });

  return (
    <div className="space-y-6">
      <EnquirySummary counts={counts} />

      <section aria-labelledby="enquiry-list-heading" className="space-y-4">
        <h2 id="enquiry-list-heading" className="sr-only">
          Enquiry list
        </h2>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <StatusFilter active={status} />
          {/* Announces the new result count after a filter or page change. */}
          <p aria-live="polite" className="text-sm font-medium text-muted tabular-nums">
            {summary}
          </p>
        </div>

        {items.length === 0 ? (
          <EmptyState
            title={statusLabel ? `No ${statusLabel.toLowerCase()} enquiries` : "No enquiries yet"}
            description={
              statusLabel
                ? "Nothing has this status at the moment."
                : "New enquiries from the website's booking form will appear here as soon as they arrive."
            }
            action={statusLabel ? { label: "View all enquiries", href: buildDashboardHref() } : undefined}
          />
        ) : (
          <>
            <div className="hidden md:block">
              <EnquiryTable
                enquiries={items}
                caption={`${summary}, newest first. Page ${page} of ${pageCount}.`}
              />
            </div>
            <div className="md:hidden">
              <EnquiryCardList enquiries={items} />
            </div>
            <Pagination page={page} pageCount={pageCount} status={status} />
          </>
        )}
      </section>
    </div>
  );
}
