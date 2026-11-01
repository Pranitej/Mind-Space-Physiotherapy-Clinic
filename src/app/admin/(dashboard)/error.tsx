"use client";

import { ErrorPanel } from "@/components/admin/error-panel";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RefreshButton } from "@/components/admin/refresh-button";

/**
 * Last-resort boundary for the dashboard segment. Expected failures (the
 * database being unreachable) are already handled inline by the page; this
 * catches anything else while keeping the admin shell and sign-out usable.
 *
 * In production, server error messages are replaced by Next.js with a generic
 * one, so only the digest (which matches the server log) is shown.
 */
export default function AdminDashboardError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest =
    error instanceof Error && "digest" in error && typeof error.digest === "string"
      ? error.digest
      : undefined;

  return (
    <>
      <AdminPageHeader title="Enquiries" />
      <ErrorPanel
        title="Something went wrong"
        message={
          digest
            ? "This page couldn't be displayed. Try again, and if it keeps happening, quote the reference below."
            : "This page couldn't be displayed. Please try again."
        }
        reference={digest}
        action={<RefreshButton onRetry={retry} />}
      />
    </>
  );
}
