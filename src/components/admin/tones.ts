import type { EnquiryStatus, NotificationStatus } from "@/lib/enquiries/enquiry.types";

/**
 * Colour tones for status UI, built only from theme tokens. Colour is always a
 * secondary cue next to a text label, never the only signal.
 *
 * Tints stay at 5% so tone-coloured text keeps WCAG AA contrast (≥ 4.5:1) on
 * the tinted background. Full class strings are spelled out so Tailwind can
 * detect them.
 */
export type Tone = "attention" | "info" | "positive" | "negative" | "neutral";

export const toneClasses: Record<Tone, string> = {
  attention: "border-accent/40 bg-accent/5 text-accent",
  info: "border-primary/25 bg-primary-soft text-primary",
  positive: "border-success/40 bg-success/5 text-success",
  negative: "border-danger/40 bg-danger/5 text-danger",
  neutral: "border-border bg-background text-muted",
};

export const toneDotClasses: Record<Tone, string> = {
  attention: "bg-accent",
  info: "bg-primary",
  positive: "bg-success",
  negative: "bg-danger",
  neutral: "bg-muted",
};

/** "New" needs action, so it gets the attention colour; finished work fades to neutral. */
export const statusTones: Record<EnquiryStatus, Tone> = {
  new: "attention",
  contacted: "info",
  booked: "positive",
  closed: "neutral",
};

export const notificationTones: Record<NotificationStatus, Tone> = {
  pending: "neutral",
  sent: "positive",
  simulated: "info",
  failed: "negative",
  skipped: "neutral",
};
