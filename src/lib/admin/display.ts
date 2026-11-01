import { siteConfig } from "@/config/site.config";
import type { EnquiryStatus, NotificationStatus, TimeSlotId } from "@/lib/enquiries/enquiry.types";

/**
 * Pure presentation helpers for the admin dashboard. No React and no
 * server-only imports, so server and client components share them and they are
 * trivially unit-testable.
 */

export const ADMIN_HOME_PATH = "/admin";
export const ADMIN_LOGIN_PATH = "/admin/login";

const statusLabels = new Map<string, string>(siteConfig.admin.statuses.map((s) => [s.id, s.label]));

export function isEnquiryStatus(value: string): value is EnquiryStatus {
  return statusLabels.has(value);
}

export function getStatusLabel(status: EnquiryStatus): string {
  return statusLabels.get(status) ?? status;
}

/** "Morning (8 AM – 12 PM)", or null when the patient had no preference. */
export function getTimeSlotLabel(id: TimeSlotId | null): string | null {
  if (!id) return null;
  return siteConfig.booking.timeSlots.find((slot) => slot.id === id)?.label ?? id;
}

/** Email delivery outcomes in the clinic's words rather than the system's. */
export const notificationStatusLabels: Record<NotificationStatus, string> = {
  pending: "Pending",
  sent: "Sent",
  simulated: "Simulated",
  failed: "Failed",
  skipped: "Skipped",
};

/**
 * Shortens text for a preview, preferring a word boundary. Splits by code
 * point (not UTF-16 unit) so emoji and other astral characters are never cut
 * in half.
 */
export function truncateText(text: string, maxChars: number): string {
  const chars = Array.from(text.trim());
  if (chars.length <= maxChars) return chars.join("");

  const cut = chars.slice(0, maxChars).join("");
  const lastSpace = cut.lastIndexOf(" ");
  // Only back off to the word boundary if that doesn't throw away most of the preview.
  const preview = lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${preview.trimEnd()}…`;
}

/** Dashboard URL for a filter + page. Defaults are omitted so links stay canonical. */
export function buildDashboardHref({
  status,
  page = 1,
}: { status?: EnquiryStatus; page?: number } = {}): string {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${ADMIN_HOME_PATH}?${query}` : ADMIN_HOME_PATH;
}

/** 1-based index range of the items shown, e.g. { from: 21, to: 40 }. */
export function getPageRange({ page, pageSize, total }: { page: number; pageSize: number; total: number }) {
  if (total === 0) return { from: 0, to: 0 };
  const from = (page - 1) * pageSize + 1;
  return { from, to: Math.min(total, page * pageSize) };
}

/** "Showing 21–40 of 57 enquiries" / "Showing 1 of 1 new enquiry" / "No booked enquiries". */
export function describeResults({
  from,
  to,
  total,
  statusLabel,
}: {
  from: number;
  to: number;
  total: number;
  statusLabel?: string;
}): string {
  const noun = [statusLabel?.toLowerCase(), total === 1 ? "enquiry" : "enquiries"].filter(Boolean).join(" ");
  if (total === 0) return `No ${noun}`;
  const range = from === to ? `${from}` : `${from}–${to}`;
  return `Showing ${range} of ${total} ${noun}`;
}

/** The clinic time zone's display name, e.g. "India Standard Time" (all admin times are in it). */
export function getClinicTimeZoneName(now: Date = new Date()): string {
  const { locale, timeZone } = siteConfig.locale;
  const parts = new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: "long" }).formatToParts(now);
  return parts.find((part) => part.type === "timeZoneName")?.value ?? timeZone;
}
