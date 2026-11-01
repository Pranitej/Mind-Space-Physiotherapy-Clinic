import { Mail, Phone } from "lucide-react";
import { getTimeSlotLabel, truncateText } from "@/lib/admin/display";
import type { EnquiryDto } from "@/lib/enquiries/enquiry.types";
import { formatCalendarDate, formatDateTime, formatIndianPhone } from "@/lib/format";
import { cn } from "@/lib/utils";
import { NotificationBadge } from "./badge";

/**
 * Field renderers shared by the desktop table and the mobile cards, so both
 * layouts always show an enquiry the same way.
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

export function ReceivedAt({ iso }: { iso: string }) {
  return (
    <time dateTime={iso} className="whitespace-nowrap tabular-nums">
      {formatDateTime(iso)}
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

export function ContactLinks({ enquiry }: { enquiry: Pick<EnquiryDto, "phone" | "email"> }) {
  return (
    <span className="flex flex-col items-start">
      <a href={`tel:${enquiry.phone}`} className={cn(linkClasses, "whitespace-nowrap tabular-nums")}>
        <Phone aria-hidden="true" className="size-3.5 shrink-0" />
        <span className="sr-only">Call </span>
        {formatIndianPhone(enquiry.phone)}
      </a>
      <a href={`mailto:${enquiry.email}`} className={cn(linkClasses, "break-all")}>
        <Mail aria-hidden="true" className="size-3.5 shrink-0" />
        <span className="sr-only">Email </span>
        {enquiry.email}
      </a>
    </span>
  );
}

/** Short messages are shown in full; long ones get a preview that expands in a native <details>. */
export function MessagePreview({ message }: { message: string | null }) {
  if (!message) return <Empty label="No message" />;

  const preview = truncateText(message, MESSAGE_PREVIEW_CHARS);
  if (preview === message.trim()) {
    return <p className="wrap-break-word whitespace-pre-line">{message}</p>;
  }

  return (
    <details className="group">
      <summary className="cursor-pointer list-none rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
        <span className="wrap-break-word group-open:hidden">{preview} </span>
        <span className="text-sm font-semibold whitespace-nowrap text-primary underline underline-offset-2">
          <span className="group-open:hidden">Read full message</span>
          <span className="hidden group-open:inline">Hide full message</span>
        </span>
      </summary>
      <p className="mt-1 wrap-break-word whitespace-pre-line">{message}</p>
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
