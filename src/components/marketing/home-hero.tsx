import { Clock, IndianRupee, Stethoscope, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { formatHoursRange, getTodaysHours } from "@/components/layout/opening-hours";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site.config";
import { formatInr } from "@/lib/format";

export function HomeHero() {
  const { hero } = siteConfig.pages.home;
  const image = siteConfig.images.hero;
  const todaysHours = getTodaysHours();

  // Derived from config rather than written as copy, so they can never drift
  // from the prices, team and response time shown elsewhere on the site.
  const lowestPrice = Math.min(...siteConfig.services.map((service) => service.priceFromInr));
  const trustSignals: { icon: LucideIcon; text: string }[] = [
    { icon: Stethoscope, text: `${siteConfig.team.length} specialist physiotherapists` },
    { icon: IndianRupee, text: `Sessions from ${formatInr(lowestPrice)}` },
    { icon: Clock, text: `Call back ${siteConfig.booking.responseTimeLabel}` },
  ];

  return (
    <section className="relative isolate overflow-hidden">
      <Container className="grid items-center gap-12 pt-10 pb-16 sm:pt-14 lg:grid-cols-12 lg:gap-16 lg:pt-20 lg:pb-24">
        <div className="lg:col-span-6">
          <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.14em] text-primary uppercase sm:text-sm">
            <span aria-hidden="true" className="h-px w-8 shrink-0 bg-primary/40" />
            {hero.eyebrow}
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[1.04] text-primary sm:text-6xl lg:text-[4.25rem]">
            {hero.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{hero.subtitle}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={hero.primaryCta.href} size="lg">
              {hero.primaryCta.label}
            </ButtonLink>
            <ButtonLink href={hero.secondaryCta.href} variant="outline" size="lg">
              {hero.secondaryCta.label}
            </ButtonLink>
          </div>

          <ul className="mt-10 grid gap-4 border-t border-border pt-8 text-sm text-foreground sm:grid-cols-3 sm:gap-6">
            {trustSignals.map(({ icon: SignalIcon, text }) => (
              <li key={text} className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
                <SignalIcon aria-hidden="true" className="size-5 shrink-0 text-primary" />
                <span className="leading-snug font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative lg:col-span-6">
          <div
            aria-hidden="true"
            className="absolute -top-10 -right-24 -z-10 size-80 rounded-full bg-primary-soft sm:size-96 lg:-top-16 lg:-right-20"
          />
          <div className="relative aspect-4/3 overflow-hidden rounded-4xl border border-border bg-primary-soft lg:aspect-square">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              preload
              sizes="(min-width: 1152px) 512px, (min-width: 1024px) 45vw, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)"
              className="size-full object-cover object-[75%_50%]"
            />
          </div>

          <div className="absolute -bottom-6 left-4 rounded-2xl border border-border bg-surface px-5 py-4 sm:left-6">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted uppercase">
              <span
                aria-hidden="true"
                className={todaysHours ? "size-2 rounded-full bg-success" : "size-2 rounded-full bg-muted"}
              />
              Today&apos;s hours
            </p>
            <p className="mt-1 font-display text-lg text-primary">
              {todaysHours ? formatHoursRange(todaysHours) : "Closed today"}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
