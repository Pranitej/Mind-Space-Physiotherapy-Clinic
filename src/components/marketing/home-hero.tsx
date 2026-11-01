import { ArrowRight, Check, MapPin } from "lucide-react";
import Image from "next/image";
import { formatHoursRange, getTodaysHours } from "@/components/layout/opening-hours";
import { ButtonLink, buttonArrowClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site.config";
import { formatInr } from "@/lib/format";
import { getInitials } from "./initials";

/**
 * Staggered entrance: each block rises in shortly after the one before it.
 * Written out in full because Tailwind only generates classes it can find as
 * literal strings in the source.
 */
const rise = [
  "motion-safe:animate-rise",
  "motion-safe:animate-rise motion-safe:[animation-delay:80ms]",
  "motion-safe:animate-rise motion-safe:[animation-delay:160ms]",
  "motion-safe:animate-rise motion-safe:[animation-delay:240ms]",
  "motion-safe:animate-rise motion-safe:[animation-delay:320ms]",
] as const;

export function HomeHero() {
  const { hero } = siteConfig.pages.home;
  const image = siteConfig.images.hero;
  const { team } = siteConfig;
  const todaysHours = getTodaysHours();

  // "Move freely. Live without pain." -> the second sentence is set in a lighter tone.
  const [lead, ...rest] = hero.title.split(/(?<=\.)\s+/);

  // Derived from config rather than written as copy, so they can never drift
  // from the prices and response time shown elsewhere on the site.
  const lowestPrice = Math.min(...siteConfig.services.map((service) => service.priceFromInr));
  const reassurances = [
    `Sessions from ${formatInr(lowestPrice)}`,
    `Call back ${siteConfig.booking.responseTimeLabel}`,
  ];

  return (
    <section className="relative isolate overflow-hidden">
      <HeroBackdrop />

      <Container className="grid items-center gap-16 pt-12 pb-20 sm:pt-16 lg:grid-cols-12 lg:gap-10 lg:pt-20 lg:pb-28">
        <div className="lg:col-span-7">
          <p
            className={`inline-flex items-center gap-2 rounded-full border border-primary/10 bg-surface/70 py-1.5 pr-4 pl-3 text-[0.8125rem] font-medium text-primary shadow-soft backdrop-blur ${rise[0]}`}
          >
            <MapPin aria-hidden="true" className="size-3.5" />
            {hero.eyebrow}
          </p>

          <h1
            className={`mt-7 font-display text-[2.5rem] leading-[1.04] tracking-[-0.035em] text-primary sm:text-6xl lg:text-[3.75rem] xl:text-[4.25rem] ${rise[1]}`}
          >
            <span className="block">{lead}</span>
            {rest.length > 0 && <span className="block text-primary/60">{rest.join(" ")}</span>}
          </h1>

          <p className={`mt-7 max-w-lg text-lg leading-relaxed text-muted ${rise[2]}`}>{hero.subtitle}</p>

          <div className={`mt-10 flex flex-col gap-3 sm:flex-row ${rise[3]}`}>
            <ButtonLink href={hero.primaryCta.href} size="lg">
              {hero.primaryCta.label}
              <ArrowRight aria-hidden="true" className={buttonArrowClasses} />
            </ButtonLink>
            <ButtonLink href={hero.secondaryCta.href} variant="outline" size="lg">
              {hero.secondaryCta.label}
            </ButtonLink>
          </div>

          <ul className={`mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/80 ${rise[4]}`}>
            {reassurances.map((text) => (
              <li key={text} className="flex items-center gap-2">
                <Check aria-hidden="true" className="size-4 shrink-0 text-success" strokeWidth={2.5} />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className={`relative lg:col-span-5 ${rise[2]}`}>
          <div className="relative mx-auto max-w-lg lg:max-w-none">
            {/* Offset outline behind the photo: depth without a heavy shadow. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2rem] border border-primary/15 sm:translate-x-5 sm:translate-y-5"
            />
            <div className="relative aspect-4/3 overflow-hidden rounded-[2rem] bg-primary-soft shadow-lift sm:aspect-5/4 lg:aspect-4/5">
              <div className="hero-parallax size-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  preload
                  sizes="(min-width: 1152px) 440px, (min-width: 1024px) 38vw, (min-width: 640px) 32rem, calc(100vw - 2rem)"
                  className="size-full object-cover object-[75%_50%] motion-safe:animate-settle"
                />
              </div>
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-primary/35 to-transparent"
              />
            </div>

            <div className="absolute -bottom-6 left-4 rounded-2xl border border-white/60 bg-surface/90 px-5 py-4 shadow-lift backdrop-blur-md sm:-left-6">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted uppercase">
                <span aria-hidden="true" className="relative flex size-2">
                  {todaysHours && (
                    <span className="absolute inset-0 rounded-full bg-success/60 motion-safe:animate-ping" />
                  )}
                  <span
                    className={`relative size-2 rounded-full ${todaysHours ? "bg-success" : "bg-muted"}`}
                  />
                </span>
                Today&apos;s hours
              </p>
              <p className="mt-1 font-display text-lg text-primary">
                {todaysHours ? formatHoursRange(todaysHours) : "Closed today"}
              </p>
            </div>

            <div className="absolute top-5 right-4 hidden items-center gap-3 rounded-2xl border border-white/60 bg-surface/90 py-3 pr-4 pl-3 shadow-lift backdrop-blur-md sm:flex lg:-right-4">
              <span aria-hidden="true" className="flex -space-x-2">
                {team.slice(0, 3).map((member) => (
                  <span
                    key={member.name}
                    className="grid size-9 place-items-center rounded-full bg-primary-soft text-[0.6875rem] font-semibold text-primary ring-2 ring-surface"
                  >
                    {getInitials(member.name)}
                  </span>
                ))}
              </span>
              <span className="text-sm leading-tight">
                <span className="block font-semibold text-foreground">{team.length} specialists</span>
                <span className="block text-muted">One-to-one care</span>
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Soft brand-tinted light from the top right, with a fine dot texture. Purely decorative. */
function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_85%_0%,var(--color-primary-soft),transparent_70%)]" />
      <div className="dot-grid absolute inset-0 opacity-70" />
    </div>
  );
}
