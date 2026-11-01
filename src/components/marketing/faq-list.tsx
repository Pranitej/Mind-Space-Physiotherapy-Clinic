import { Plus } from "lucide-react";
import { AnimatedDetails } from "@/components/ui/animated-details";
import type { Faq } from "@/config/types";
import { cn } from "@/lib/utils";

/**
 * Accordion built on native <details>/<summary> (keyboard and screen-reader
 * support and find-in-page for free), with an animated open and close.
 */
export function FaqList({ faqs, className }: { faqs: ReadonlyArray<Faq>; className?: string }) {
  return (
    <div
      data-reveal
      className={cn(
        "divide-y divide-border rounded-3xl border border-border bg-surface shadow-soft",
        className,
      )}
    >
      {faqs.map((faq) => (
        <AnimatedDetails
          key={faq.question}
          className="group px-6 sm:px-8"
          summaryClassName={
            "flex min-h-18 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left " +
            "font-semibold text-foreground transition-colors duration-200 hover:text-primary " +
            "[&::-webkit-details-marker]:hidden"
          }
          summary={
            <>
              {faq.question}
              <span
                aria-hidden="true"
                className="disclosure-icon grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"
              >
                <Plus className="size-4" />
              </span>
            </>
          }
        >
          <p className="max-w-2xl pb-6 leading-relaxed text-muted">{faq.answer}</p>
        </AnimatedDetails>
      ))}
    </div>
  );
}
