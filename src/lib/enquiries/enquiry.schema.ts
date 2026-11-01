import { z } from "zod";
import { enquiryServiceOptions, siteConfig } from "@/config/site.config";
import { normalizeIndianMobile, todayInClinicTimeZone } from "@/lib/format";

/**
 * Validation for the public enquiry form. This module is imported by BOTH the
 * browser (react-hook-form resolver, for instant feedback) and the API route
 * (the actual security boundary), so the two can never drift apart. It must
 * therefore stay free of server-only imports.
 *
 * The schema is idempotent: parsing its own output succeeds and returns the
 * same value. That lets the form post the already-normalised values while the
 * server still re-validates everything from scratch.
 */

const { maxDaysAhead, messageMaxLength, timeSlots } = siteConfig.booking;

const NAME_MIN = 2;
const NAME_MAX = 80;
const EMAIL_MAX = 254;

const SERVICE_SLUGS = enquiryServiceOptions.map((option) => option.slug);
const TIME_SLOT_IDS = timeSlots.map((slot) => slot.id);

// \p{M} (combining marks) is required alongside \p{L}: vowel signs in Telugu,
// Hindi, Tamil etc. are marks, so "రాము" would otherwise be rejected. The
// typographic apostrophe is what phone keyboards insert for "D’Souza".
const NAME_PATTERN = /^\p{L}[\p{L}\p{M} .'’-]*$/u;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const PHONE_ERROR = "Enter a valid 10-digit Indian mobile number";
export const CONSENT_ERROR = "Please confirm you agree to be contacted";

/** Adds whole days to a "YYYY-MM-DD" calendar date (no time-zone shifting). */
function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Rejects well-formed but impossible dates such as "2026-02-30". */
function isCalendarDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

/**
 * The selectable range for the preferred date, as "YYYY-MM-DD" in the clinic's
 * time zone. Computed per call (never at module load) so a long-lived server
 * instance does not keep yesterday's "today".
 */
export function getPreferredDateRange(now: Date = new Date()): { min: string; max: string } {
  const min = todayInClinicTimeZone(now);
  return { min, max: addDays(min, maxDaysAhead) };
}

export function isEnquiryServiceSlug(value: string): boolean {
  return SERVICE_SLUGS.includes(value);
}

/** "" / null / undefined → null, so optional fields are stored consistently. */
function emptyToNull<T extends string>(value: T | "" | null | undefined): T | null {
  return value ? value : null;
}

export const enquiryFormSchema = z.object({
  name: z
    .string({ error: "Please enter your name" })
    .trim()
    .overwrite((value) => value.replace(/\s+/g, " "))
    .min(NAME_MIN, { error: "Please enter your full name" })
    .max(NAME_MAX, { error: `Name must be ${NAME_MAX} characters or fewer` })
    .regex(NAME_PATTERN, {
      error: "Name can only contain letters, spaces, full stops, apostrophes and hyphens",
    }),

  email: z
    .string({ error: "Please enter your email address" })
    .trim()
    .toLowerCase()
    .max(EMAIL_MAX, { error: `Email must be ${EMAIL_MAX} characters or fewer` })
    .pipe(z.email({ error: "Enter a valid email address, e.g. name@example.com" })),

  phone: z
    .string({ error: PHONE_ERROR })
    .trim()
    .transform((value, ctx) => {
      const e164 = normalizeIndianMobile(value);
      if (!e164) {
        ctx.issues.push({ code: "custom", message: PHONE_ERROR, input: value });
        return z.NEVER;
      }
      return e164;
    }),

  service: z.enum(SERVICE_SLUGS, { error: "Please choose a service" }),

  preferredDate: z
    .string({ error: "Enter a valid date" })
    .trim()
    .nullish()
    .transform((value, ctx) => {
      const date = emptyToNull(value);
      if (date === null) return null;

      const { min, max } = getPreferredDateRange();
      let message: string | undefined;
      if (!isCalendarDate(date)) message = "Enter a valid date";
      else if (date < min) message = "Please choose today or a later date";
      else if (date > max) message = `Please choose a date within the next ${maxDaysAhead} days`;

      if (message) {
        ctx.issues.push({ code: "custom", message, input: date });
        return z.NEVER;
      }
      return date;
    }),

  preferredTime: z
    .enum([...TIME_SLOT_IDS, ""], { error: "Please choose one of the listed times" })
    .nullish()
    .transform(emptyToNull),

  message: z
    .string({ error: "Message must be text" })
    .trim()
    .max(messageMaxLength, { error: `Please keep your message to ${messageMaxLength} characters or fewer` })
    .nullish()
    .transform(emptyToNull),

  // Accept a boolean (what a checkbox produces) but only let `true` through.
  consent: z.boolean({ error: CONSENT_ERROR }).pipe(z.literal(true, { error: CONSENT_ERROR })),

  /** Honeypot. Hidden from people; anything typed here marks the request as a bot. */
  website: z.string().max(500).optional(),
});

/** Raw form state (what the inputs hold). */
export type EnquiryFormInput = z.input<typeof enquiryFormSchema>;
/** Validated, normalised values (what the server stores). */
export type EnquiryFormValues = z.output<typeof enquiryFormSchema>;
export type EnquiryFieldName = keyof EnquiryFormInput;

export const enquiryFieldNames = Object.keys(enquiryFormSchema.shape) as EnquiryFieldName[];

/** `data` payload of a successful `POST /api/enquiries` (HTTP 201). */
export interface EnquiryCreatedResponse {
  reference: string;
}
