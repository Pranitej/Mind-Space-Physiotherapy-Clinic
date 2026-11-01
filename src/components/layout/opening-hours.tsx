import { siteConfig } from "@/config/site.config";
import type { OpeningHours } from "@/config/types";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type Weekday = OpeningHours["days"][number];

const weekdayFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  timeZone: siteConfig.locale.timeZone,
});

/** "8:00 AM – 8:00 PM" */
export function formatHoursRange(hours: Pick<OpeningHours, "opens" | "closes">): string {
  return `${formatTime(hours.opens)} – ${formatTime(hours.closes)}`;
}

/**
 * Opening hours that apply today in the clinic's time zone (not the server's
 * or the visitor's), or null when the clinic is closed all day.
 */
export function getTodaysHours(now: Date = new Date()): OpeningHours | null {
  const today = weekdayFormatter.format(now) as Weekday;
  return siteConfig.contact.hours.find((entry) => entry.days.some((day) => day === today)) ?? null;
}

interface OpeningHoursListProps {
  tone?: "default" | "inverse";
  className?: string;
}

export function OpeningHoursList({ tone = "default", className }: OpeningHoursListProps) {
  const inverse = tone === "inverse";

  return (
    <dl className={cn("space-y-3 text-sm", className)}>
      {siteConfig.contact.hours.map((entry) => (
        <div key={entry.label}>
          <dt className={inverse ? "text-primary-foreground/70" : "text-muted"}>{entry.label}</dt>
          <dd className={cn("mt-0.5 font-medium", inverse ? "text-primary-foreground" : "text-foreground")}>
            {formatHoursRange(entry)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
