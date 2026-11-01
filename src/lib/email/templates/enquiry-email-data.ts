import { siteConfig } from "@/config/site.config";
import type { EnquiryDocument, TimeSlotId } from "@/lib/enquiries/enquiry.types";

/** The subset of an enquiry the email templates are allowed to see. */
export type EnquiryEmailData = Pick<
  EnquiryDocument,
  | "reference"
  | "name"
  | "email"
  | "phone"
  | "service"
  | "preferredDate"
  | "preferredTime"
  | "message"
  | "createdAt"
>;

/**
 * Best-effort first name for a friendly greeting. Skips leading honorifics and
 * initials ("Dr. Ananya Rao" → "Ananya", "K. Ravi" → "Ravi"), which are common
 * in Indian names, and falls back to the full name.
 */
export function getFirstName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts.find((part) => !part.endsWith(".") && part.length > 1) ?? fullName.trim();
}

export function getTimeSlotLabel(id: TimeSlotId): string {
  return siteConfig.booking.timeSlots.find((slot) => slot.id === id)?.label ?? id;
}
