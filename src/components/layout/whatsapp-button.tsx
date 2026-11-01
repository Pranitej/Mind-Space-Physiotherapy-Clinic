import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/format";

const BOOKING_MESSAGE = "Hi, I'd like to book an appointment";

/**
 * Floating WhatsApp shortcut. Icon-only on phones (where it must not cover
 * content), labelled pill from `sm` up. Offsets respect the iOS safe area.
 */
export function WhatsAppButton() {
  return (
    <a
      href={whatsappUrl(BOOKING_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp (opens in a new tab)"
      className={
        "fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 " +
        "inline-flex size-14 items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground " +
        "shadow-lg ring-1 shadow-primary/25 ring-primary-foreground/15 transition-colors hover:bg-primary-hover " +
        "sm:w-auto sm:px-5 print:hidden"
      }
    >
      <MessageCircle aria-hidden="true" className="size-6" />
      <span className="hidden text-sm font-semibold sm:inline">Chat on WhatsApp</span>
    </a>
  );
}
