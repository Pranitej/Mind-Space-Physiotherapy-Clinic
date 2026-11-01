import { enquiryServiceOptions, siteConfig } from "@/config/site.config";
import type { EnquiryStatus } from "@/lib/enquiries/enquiry.types";

/**
 * Search, filter and sort options for the admin enquiry list, shared by the
 * dashboard UI, the URL and API validation, and the database query, so an
 * option is added in exactly one place. Plain module: client components use it.
 */

/** Longest search the list accepts; also the search box's maxLength. */
export const SEARCH_MAX_LENGTH = 100;

export const sortOptions = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "name-asc", label: "Name: A to Z" },
  { id: "name-desc", label: "Name: Z to A" },
  { id: "preferred-date", label: "Preferred date: soonest" },
  { id: "updated", label: "Recently updated" },
] as const;

export type EnquirySort = (typeof sortOptions)[number]["id"];

export const DEFAULT_SORT: EnquirySort = "newest";

export const periodOptions = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
] as const;

export type EnquiryPeriod = (typeof periodOptions)[number]["id"];

const PERIOD_DAYS: Record<Exclude<EnquiryPeriod, "today">, number> = { "7d": 7, "30d": 30, "90d": 90 };

/** Services an enquiry can be for: every service plus the general assessment. */
export const serviceFilterOptions = enquiryServiceOptions;

export interface EnquiryListFilters {
  status?: EnquiryStatus;
  /** Free text matched against name, email, reference, message and phone digits. */
  search?: string;
  service?: string;
  period?: EnquiryPeriod;
  sort?: EnquirySort;
}

export function getSortLabel(sort: EnquirySort): string {
  return sortOptions.find((option) => option.id === sort)?.label ?? sort;
}

export function getPeriodLabel(period: EnquiryPeriod): string {
  return periodOptions.find((option) => option.id === period)?.label ?? period;
}

/**
 * Earliest received time included by a period, or undefined for "any time".
 * "Today" starts at midnight in the clinic's time zone, not the server's.
 */
export function getReceivedSince(
  period: EnquiryPeriod | undefined,
  now: Date = new Date(),
): Date | undefined {
  if (!period) return undefined;
  if (period === "today") return startOfDayInTimeZone(now, siteConfig.locale.timeZone);
  return new Date(now.getTime() - PERIOD_DAYS[period] * 24 * 60 * 60 * 1000);
}

/** Midnight at the start of `now`'s calendar day in `timeZone`. */
function startOfDayInTimeZone(now: Date, timeZone: string): Date {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hourCycle: "h23",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const elapsedToday =
    ((part("hour") * 60 + part("minute")) * 60 + part("second")) * 1000 + now.getMilliseconds();
  return new Date(now.getTime() - elapsedToday);
}
