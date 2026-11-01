import { Plus } from "lucide-react";
import type { Faq } from "@/config/types";
import { cn } from "@/lib/utils";

/**
 * Native <details>/<summary> accordion: keyboard and screen-reader support,
 * find-in-page and no client JavaScript, for free.
 */
export function FaqList({ faqs, className }: { faqs: ReadonlyArray<Faq>; className?: string }) {
  return (
    <div className={cn("divide-y divide-border rounded-3xl border border-border bg-surface", className)}>
      {faqs.map((faq) => (
        <details key={faq.question} className="group px-6 sm:px-8">
          <summary
            className={
              "flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left " +
              "font-semibold text-foreground transition-colors hover:text-primary " +
              "[&::-webkit-details-marker]:hidden"
            }
          >
            {faq.question}
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"
            >
              <Plus className="size-4 group-open:rotate-45 motion-safe:transition-transform" />
            </span>
          </summary>
          <p className="max-w-2xl pb-6 leading-relaxed text-muted">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
