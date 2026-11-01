"use client";

import { ChevronDown, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useOptimistic, useState, useTransition, type ChangeEvent } from "react";
import { siteConfig } from "@/config/site.config";
import { adminApi, describeStatusUpdateFailure } from "@/lib/admin/api-client";
import { ADMIN_LOGIN_PATH, isEnquiryStatus } from "@/lib/admin/display";
import type { EnquiryStatus } from "@/lib/enquiries/enquiry.types";
import { cn } from "@/lib/utils";
import { statusTones, toneClasses } from "./tones";

interface StatusSelectProps {
  enquiryId: string;
  /** Used in the accessible label so each select in the list is distinguishable. */
  reference: string;
  status: EnquiryStatus;
  className?: string;
}

/**
 * Changes an enquiry's status. The new value shows immediately (optimistic),
 * the API persists it, and `router.refresh()` re-renders the dashboard from
 * the database. On failure the transition ends without a refresh, so React
 * drops the optimistic value: the rollback is automatic.
 */
export function StatusSelect({ enquiryId, reference, status, className }: StatusSelectProps) {
  const router = useRouter();
  const selectId = useId();
  const errorId = `${selectId}-error`;
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value;
    // Ignored changes snap back because the select is controlled.
    if (isPending || !isEnquiryStatus(next) || next === optimisticStatus) return;

    setError(null);
    startTransition(async () => {
      setOptimisticStatus(next);
      const result = await adminApi.updateEnquiryStatus(enquiryId, next);
      if (result.ok) {
        router.refresh();
      } else if (result.status === 401) {
        router.replace(ADMIN_LOGIN_PATH);
      } else {
        setError(describeStatusUpdateFailure(result));
      }
    });
  }

  return (
    <div className={className}>
      <label htmlFor={selectId} className="sr-only">
        Status of enquiry {reference}
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={optimisticStatus}
          onChange={handleChange}
          // aria-disabled rather than disabled: disabling the focused control would drop
          // keyboard and screen-reader focus to <body> mid-update.
          aria-disabled={isPending || undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-11 w-full min-w-36 cursor-pointer appearance-none rounded-lg border py-2 pr-9 pl-3 text-sm font-semibold",
            "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
            "aria-disabled:cursor-wait aria-disabled:opacity-70",
            toneClasses[statusTones[optimisticStatus]],
          )}
        >
          {siteConfig.admin.statuses.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        {isPending ? (
          <LoaderCircle
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 motion-safe:animate-spin"
          />
        ) : (
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
          />
        )}
      </div>
      <span aria-live="polite" className="sr-only">
        {isPending ? "Saving status…" : ""}
      </span>
      {error && (
        <p id={errorId} role="alert" className="mt-1 max-w-56 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
