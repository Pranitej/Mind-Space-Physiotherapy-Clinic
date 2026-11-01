import { siteConfig } from "@/config/site.config";

/**
 * Indian-locale formatting helpers. All user-facing numbers, prices, dates and
 * phone numbers go through these so the format is consistent site-wide.
 */
const { locale, timeZone, currency } = siteConfig.locale;

const inrFormatter = new Intl.NumberFormat(locale, {
  style: "currency",
  currency,
  maximumFractionDigits: 0,
});

/** 1200 → "₹1,200"; 150000 → "₹1,50,000" (Indian digit grouping). */
export function formatInr(amount: number): string {
  return inrFormatter.format(amount);
}

const dateFormatter = new Intl.DateTimeFormat(locale, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone,
});

const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone,
});

/** → "01/11/2026" (DD/MM/YYYY, IST). Accepts a Date or an ISO string. */
export function formatDate(value: Date | string): string {
  return dateFormatter.format(toDate(value));
}

/** → "01/11/2026, 3:45 pm" (IST). */
export function formatDateTime(value: Date | string): string {
  return dateTimeFormatter.format(toDate(value));
}

/**
 * Formats a calendar date stored as "YYYY-MM-DD" without time-zone shifting
 * → "05/11/2026".
 */
export function formatCalendarDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

/** Today's calendar date in the clinic's time zone as "YYYY-MM-DD". */
export function todayInClinicTimeZone(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** "08:00" → "8:00 AM"; "20:00" → "8:00 PM". */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * Normalises any common way of writing an Indian mobile number
 * ("98765 43210", "+91-98765-43210", "098765 43210", "919876543210")
 * to E.164 ("+919876543210"). Returns null if it is not a valid Indian mobile
 * number (10 digits starting with 6–9).
 */
export function normalizeIndianMobile(input: string): string | null {
  const digits = input.replace(/[\s\-().]/g, "").replace(/^\+/, "");
  const national = digits.replace(/^(?:91|0)(?=[6-9]\d{9}$)/, "");
  return /^[6-9]\d{9}$/.test(national) ? `+91${national}` : null;
}

/** "+919876543210" → "+91 98765 43210". Falls back to the input if not E.164 Indian. */
export function formatIndianPhone(e164: string): string {
  const match = /^\+91(\d{5})(\d{5})$/.exec(e164);
  return match ? `+91 ${match[1]} ${match[2]}` : e164;
}

export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${siteConfig.contact.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function formatAddressLines(): string[] {
  const { address } = siteConfig.contact;
  return [
    address.line1,
    `${address.line2}, ${address.locality}`,
    `${address.city}, ${address.state} ${address.pincode}`,
  ];
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}
