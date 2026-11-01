/**
 * Type contract for `site.config.ts`. Every page, component, email template,
 * SEO helper and security control reads its business data from that single
 * object, so these types are what keep a content edit from breaking the build.
 */

export type IconName =
  | "activity"
  | "bone"
  | "brain"
  | "dumbbell"
  | "heart-pulse"
  | "home"
  | "baby"
  | "hand"
  | "shield-check"
  | "clock"
  | "users"
  | "award"
  | "calendar-check"
  | "sparkles";

export interface Address {
  line1: string;
  line2: string;
  locality: string;
  city: string;
  state: string;
  /** 6-digit Indian PIN code. */
  pincode: string;
  country: string;
  /** ISO 3166-1 alpha-2. */
  countryCode: string;
}

export interface OpeningHours {
  /** Human readable label, e.g. "Mon – Sat". */
  label: string;
  /** schema.org day names, used for structured data. */
  days: ReadonlyArray<"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday">;
  /** 24h "HH:mm" in clinic local time. */
  opens: string;
  closes: string;
}

export interface Service {
  /** URL-safe id; also the value stored on an enquiry. */
  slug: string;
  name: string;
  /** One-line summary for cards (≈ 15 words). */
  summary: string;
  /** Longer description for the services page. */
  description: string;
  /** Conditions / people this service is for. */
  idealFor: ReadonlyArray<string>;
  /** Session length in minutes. */
  durationMinutes: number;
  /** Starting price per session in INR (whole rupees). */
  priceFromInr: number;
  icon: IconName;
  /** Shown on the home page when true. */
  featured: boolean;
}

export interface TeamMember {
  name: string;
  role: string;
  qualifications: string;
  experienceYears: number;
  bio: string;
  specialities: ReadonlyArray<string>;
}

export interface Testimonial {
  quote: string;
  author: string;
  context: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Value {
  title: string;
  description: string;
  icon: IconName;
}

export interface ImageAsset {
  /** Path under /public. */
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface PageSeo {
  title: string;
  description: string;
}

export interface ThemeTokens {
  /** Brand primary — headings, links, header surfaces. */
  primary: string;
  primaryHover: string;
  primaryForeground: string;
  /** Reserved for conversion actions (book / submit) so they always stand out. */
  accent: string;
  accentHover: string;
  accentForeground: string;
  /** Soft tint of primary used for section backgrounds and chips. */
  primarySoft: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  border: string;
  success: string;
  danger: string;
}

export interface RateLimitRule {
  /** Maximum requests allowed per window. */
  limit: number;
  windowSeconds: number;
}

export type TimeSlotId = "morning" | "afternoon" | "evening";

export type EnquiryStatus = "new" | "contacted" | "booked" | "closed";
