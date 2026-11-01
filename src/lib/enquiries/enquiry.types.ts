import type { ObjectId } from "mongodb";
import type { EnquiryStatus, TimeSlotId } from "@/config/types";

export type { EnquiryStatus, TimeSlotId };

/** Outcome of an email notification, recorded on the enquiry for auditability. */
export type NotificationStatus = "pending" | "sent" | "simulated" | "failed" | "skipped";

export type NotificationChannel = "patient" | "clinic";

/** Shape of a document in the `enquiries` collection. */
export interface EnquiryDocument {
  _id: ObjectId;
  /** Human-friendly reference shown to the patient and in the admin, e.g. "MS-261101-7K3QX". */
  reference: string;
  name: string;
  /** Lower-cased. */
  email: string;
  /** E.164, e.g. "+919876543210". */
  phone: string;
  /** Service slug from siteConfig, or the general-assessment slug. */
  service: string;
  /** Calendar date "YYYY-MM-DD" (clinic time zone), if the patient chose one. */
  preferredDate: string | null;
  preferredTime: TimeSlotId | null;
  message: string | null;
  status: EnquiryStatus;
  /** When the patient gave consent to be contacted (DPDP Act). */
  consentAt: Date;
  /** Abuse-investigation metadata. The IP is stored only as a keyed hash. */
  source: { ipHash: string; userAgent: string | null };
  notifications: Record<NotificationChannel, NotificationStatus>;
  /**
   * Retention deadline: a TTL index deletes the enquiry at this time. Absent
   * while the status is "booked", because patient records are kept.
   */
  retainUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** Fields supplied when creating an enquiry; the repository fills in the rest. */
export type NewEnquiry = Pick<
  EnquiryDocument,
  | "name"
  | "email"
  | "phone"
  | "service"
  | "preferredDate"
  | "preferredTime"
  | "message"
  | "consentAt"
  | "source"
>;

/**
 * Serializable view of an enquiry for the admin UI (safe to pass from server
 * to client components). Internal abuse metadata is deliberately omitted.
 */
export interface EnquiryDto {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  preferredDate: string | null;
  preferredTime: TimeSlotId | null;
  message: string | null;
  status: EnquiryStatus;
  notifications: Record<NotificationChannel, NotificationStatus>;
  /** ISO 8601 timestamps. */
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryPage {
  items: EnquiryDto[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export type EnquiryStatusCounts = Record<EnquiryStatus, number> & { total: number };
