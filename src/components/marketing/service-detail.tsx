import { Check, Clock, IndianRupee } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { Service } from "@/config/types";
import { bookServiceHref, formatSessionLength, formatSessionPrice } from "./service-meta";

/** Full description of one service on /services, addressable as /services#<slug>. */
export function ServiceDetail({ service, index }: { service: Service; index: number }) {
  const headingId = `${service.slug}-title`;

  return (
    <section
      id={service.slug}
      aria-labelledby={headingId}
      className="grid scroll-mt-6 gap-8 rounded-3xl border border-border bg-surface p-6 sm:p-10 lg:grid-cols-12 lg:gap-12"
    >
      <div className="lg:col-span-8">
        <div className="flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Icon name={service.icon} className="size-6" />
          </span>
          <span aria-hidden="true" className="font-display text-sm text-muted tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <h2 id={headingId} className="mt-6 font-display text-3xl text-primary">
          {service.name}
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{service.description}</p>

        <h3 className="mt-8 font-sans text-sm font-semibold tracking-wide text-foreground uppercase">
          Ideal for
        </h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {service.idealFor.map((item) => (
            <li key={item} className="flex gap-3 leading-snug">
              <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-success" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col justify-between gap-8 rounded-2xl bg-primary-soft p-6 sm:p-8 lg:col-span-4">
        <dl className="space-y-5">
          <div>
            <dt className="flex items-center gap-2 text-sm text-muted">
              <Clock aria-hidden="true" className="size-4" />
              Session length
            </dt>
            <dd className="mt-1 text-lg font-semibold text-foreground">{formatSessionLength(service)}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-sm text-muted">
              <IndianRupee aria-hidden="true" className="size-4" />
              Fee
            </dt>
            <dd className="mt-1 text-lg font-semibold text-foreground">{formatSessionPrice(service)}</dd>
          </div>
        </dl>
        <ButtonLink href={bookServiceHref(service)} className="w-full">
          Book this service<span className="sr-only">: {service.name}</span>
        </ButtonLink>
      </div>
    </section>
  );
}
