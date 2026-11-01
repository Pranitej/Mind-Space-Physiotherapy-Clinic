import type { ReactNode } from "react";
import { notificationStatusLabels } from "@/lib/admin/display";
import type { NotificationChannel, NotificationStatus } from "@/lib/enquiries/enquiry.types";
import { cn } from "@/lib/utils";
import { notificationTones, toneClasses, type Tone } from "./tones";

export function Badge({
  tone,
  className,
  children,
}: {
  tone: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const channelLabels: Record<NotificationChannel, string> = {
  patient: "Patient",
  clinic: "Clinic",
};

/** Delivery outcome of one notification email, e.g. "Patient: Sent". */
export function NotificationBadge({
  channel,
  status,
}: {
  channel: NotificationChannel;
  status: NotificationStatus;
}) {
  return (
    <Badge tone={notificationTones[status]}>
      <span className="font-normal">{channelLabels[channel]}:</span> {notificationStatusLabels[status]}
    </Badge>
  );
}
