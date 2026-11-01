import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/format";

const BOOKING_MESSAGE = "Hi, I'd like to book an appointment";

/**
 * Floating WhatsApp shortcut. A compact round button at every size, so it
 * never covers page content; on hover or keyboard focus it widens to show its
 * label. Offsets respect the iOS safe area.
 */
export function WhatsAppButton() {
  return (
    <a
      href={whatsappUrl(BOOKING_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp (opens in a new tab)"
      className={
        "group fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 " +
        "inline-flex h-14 items-center rounded-full bg-primary px-4 text-primary-foreground shadow-lift " +
        "ring-1 ring-primary-foreground/10 transition-[background-color,transform] duration-500 ease-smooth " +
        "hover:-translate-y-0.5 hover:bg-primary-hover motion-safe:animate-rise motion-safe:[animation-delay:600ms] " +
        "print:hidden"
      }
    >
      <MessageCircle aria-hidden="true" className="size-6 shrink-0" />
      <span
        aria-hidden="true"
        className={
          "max-w-0 overflow-hidden text-sm font-semibold whitespace-nowrap opacity-0 " +
          "transition-[max-width,opacity,margin] duration-500 ease-smooth " +
          "group-hover:ml-2.5 group-hover:max-w-40 group-hover:opacity-100 " +
          "group-focus-visible:ml-2.5 group-focus-visible:max-w-40 group-focus-visible:opacity-100"
        }
      >
        Chat on WhatsApp
      </span>
    </a>
  );
}
