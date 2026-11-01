import { CircleAlert, CircleCheck, Clock, Mail, MailMinus, Phone } from "lucide-react";
import { getTimeSlotLabel, notificationStatusLabels, truncateText } from "@/lib/admin/display";
import type { EnquiryDto, NotificationStatus } from "@/lib/enquiries/enquiry.types";
import { formatCalendarDate, formatDateTime, formatIndianPhone } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge, NotificationBadge } from "./badge";
import { Highlight } from "./highlight";
import type { Tone } from "./tones";

/**
 * Field renderers shared by the desktop table and the mobile cards, so both
 * layouts always show an enquiry the same way. `term` is the active search,
 * highlighted wherever it matched.
 */

const MESSAGE_PREVIEW_CHARS = 90;

// 44px tall for touch; a mouse pointer gets the denser size so table rows stay compact.
const linkClasses = cn(
  "inline-flex min-h-11 items-center gap-1.5 rounded-md font-medium text-primary underline-offset-2",
  "hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 pointer-fine:min-h-7",
);

function Empty({ label }: { label: string }) {
  return <span className="text-muted">{label}</span>;
}

/** "01/11/2026, 3:45 pm", or the date over the time when `stacked`. */
export function ReceivedAt({ iso, stacked = false }: { iso: string; stacked?: boolean }) {
  const formatted = formatDateTime(iso);
  if (!stacked) {
    return (
      <time dateTime={iso} className="whitespace-nowrap tabular-nums">
        {formatted}
      </time>
    );
  }
  const [date, time] = formatted.split(", ");
  return (
    <time dateTime={iso} className="flex flex-col whitespace-nowrap tabular-nums">
      <span className="font-medium text-foreground">{date}</span>
      <span className="text-xs text-muted">{time}</span>
    </time>
  );
}

export function PreferredSlot({ enquiry }: { enquiry: Pick<EnquiryDto, "preferredDate" | "preferredTime"> }) {
  const slot = getTimeSlotLabel(enquiry.preferredTime);
  if (!enquiry.preferredDate && !slot) return <Empty label="No preference" />;
  return (
    <span className="flex flex-col">
      {enquiry.preferredDate && (
        <time dateTime={enquiry.preferredDate} className="whitespace-nowrap tabular-nums">
          {formatCalendarDate(enquiry.preferredDate)}
        </time>
      )}
      {slot && <span className="text-xs text-muted">{slot}</span>}
    </span>
  );
}

export function ContactLinks({
  enquiry,
  term,
  compact = false,
}: {
  enquiry: Pick<EnquiryDto, "phone" | "email">;
  term?: string;
  /** Table cells: keep the email on one line, truncated, with the full address as a tooltip. */
  compact?: boolean;
}) {
  return (
    <span className="flex min-w-0 flex-col items-start">
      <a href={`tel:${enquiry.phone}`} className={cn(linkClasses, "whitespace-nowrap tabular-nums")}>
        <Phone aria-hidden="true" className="size-3.5 shrink-0" />
        <span className="sr-only">Call </span>
        {formatIndianPhone(enquiry.phone)}
      </a>
      <a
        href={`mailto:${enquiry.email}`}
        title={compact ? enquiry.email : undefined}
        className={cn(linkClasses, "max-w-full", !compact && "break-all")}
      >
        <Mail aria-hidden="true" className="size-3.5 shrink-0" />
        <span className="sr-only">Email </span>
        <span className={cn("min-w-0", compact && "truncate")}>
          <Highlight text={enquiry.email} term={term} />
        </span>
      </a>
    </span>
  );
}

/** Short messages are shown in full; long ones get a preview that expands in a native <details>. */
export function MessagePreview({ message, term }: { message: string | null; term?: string }) {
  if (!message) return <Empty label="No message" />;

  const preview = truncateText(message, MESSAGE_PREVIEW_CHARS);
  if (preview === message.trim()) {
    return (
      <p className="wrap-break-word whitespace-pre-line">
        <Highlight text={message} term={term} />
      </p>
    );
  }

  return (
    <details className="group">
      <summary className="cursor-pointer list-none rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
        <span className="wrap-break-word group-open:hidden">
          <Highlight text={preview} term={term} />{" "}
        </span>
        <span className="text-sm font-semibold whitespace-nowrap text-primary underline underline-offset-2">
          <span className="group-open:hidden">Read full message</span>
          <span className="hidden group-open:inline">Hide full message</span>
        </span>
      </summary>
      <p className="mt-1 wrap-break-word whitespace-pre-line motion-safe:animate-fade-in">
        <Highlight text={message} term={term} />
      </p>
    </details>
  );
}

export function DeliveryBadges({ notifications }: { notifications: EnquiryDto["notifications"] }) {
  return (
    <span className="flex flex-wrap gap-1">
      <NotificationBadge channel="patient" status={notifications.patient} />
      <NotificationBadge channel="clinic" status={notifications.clinic} />
    </span>
  );
}

/**
 * Both notification emails as one compact badge for the table: the worst
 * outcome wins, so a failure is never hidden behind a success. The full
 * per-email breakdown is in the tooltip and read out to screen readers.
 */
export function DeliverySummary({ notifications }: { notifications: EnquiryDto["notifications"] }) {
  const outcomes: NotificationStatus[] = [notifications.patient, notifications.clinic];
  const summary = summariseDelivery(outcomes);
  const detail = `Patient email: ${notificationStatusLabels[notifications.patient]}. Clinic email: ${notificationStatusLabels[notifications.clinic]}.`;
  const SummaryIcon = summary.icon;

  return (
    <span title={detail}>
      <Badge tone={summary.tone}>
        <SummaryIcon aria-hidden="true" className="size-3" />
        {summary.label}
      </Badge>
      <span className="sr-only"> {detail}</span>
    </span>
  );
}

function summariseDelivery(outcomes: NotificationStatus[]): { label: string; tone: Tone; icon: typeof Mail } {
  if (outcomes.includes("failed")) return { label: "Email failed", tone: "negative", icon: CircleAlert };
  if (outcomes.includes("pending")) return { label: "Sending", tone: "neutral", icon: Clock };
  if (outcomes.every((outcome) => outcome === "sent"))
    return { label: "Emails sent", tone: "positive", icon: CircleCheck };
  if (outcomes.includes("simulated")) return { label: "Simulated", tone: "info", icon: Mail };
  return { label: "Not sent", tone: "neutral", icon: MailMinus };
}
