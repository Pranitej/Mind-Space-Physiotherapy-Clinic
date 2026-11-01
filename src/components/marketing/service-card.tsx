import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { Service } from "@/config/types";
import { bookServiceHref, formatSessionLength, formatSessionPrice } from "./service-meta";

/** Summary card for a service, with a detail link and a booking shortcut. */
export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-border bg-surface p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Icon name={service.icon} className="size-6" />
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm text-muted">
          <Clock aria-hidden="true" className="size-4" />
          {formatSessionLength(service)}
        </span>
      </div>

      <h3 className="mt-6 font-display text-2xl text-primary">{service.name}</h3>
      <p className="mt-3 flex-1 leading-relaxed text-muted">{service.summary}</p>
      <p className="mt-6 text-sm font-semibold text-foreground">{formatSessionPrice(service)}</p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <Link
          href={`/services#${service.slug}`}
          className="inline-flex h-11 items-center gap-1.5 rounded-full font-semibold text-primary underline-offset-4 hover:underline"
        >
          Learn more<span className="sr-only"> about {service.name}</span>
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
        <ButtonLink href={bookServiceHref(service)}>
          Book<span className="sr-only"> {service.name}</span>
        </ButtonLink>
      </div>
    </article>
  );
}
