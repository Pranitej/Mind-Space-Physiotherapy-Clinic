import type { Service } from "@/config/types";
import { formatInr } from "@/lib/format";

/** "45 min session" */
export function formatSessionLength(service: Pick<Service, "durationMinutes">): string {
  return `${service.durationMinutes} min session`;
}

/** "From ₹900 per session" */
export function formatSessionPrice(service: Pick<Service, "priceFromInr">): string {
  return `From ${formatInr(service.priceFromInr)} per session`;
}

/** Booking link that pre-selects the service on the enquiry form. */
export function bookServiceHref(service: Pick<Service, "slug">) {
  return { pathname: "/contact", query: { service: service.slug } };
}
