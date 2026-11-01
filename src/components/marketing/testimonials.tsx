import { Quote } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site.config";
import type { Testimonial } from "@/config/types";
import { revealDelay } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** One featured quote and the rest stacked beside it, on the brand colour for contrast with the page. */
export function Testimonials() {
  const [featured, ...others] = siteConfig.testimonials;
  if (!featured) return null;

  return (
    <section className="relative isolate overflow-clip bg-primary text-primary-foreground">
      {/* Soft light from the top left keeps the dark band from feeling flat. overflow-clip, not
          overflow-hidden: a scroll container would stop the cards' scroll-driven reveal. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_0%_0%,color-mix(in_oklab,var(--color-primary-foreground)_8%,transparent),transparent_70%)]"
      />
      <Container className="py-20 lg:py-28">
        <div data-reveal>
          <Eyebrow tone="inverse">Patient stories</Eyebrow>
          <h2 className="max-w-2xl font-display text-3xl leading-[1.1] tracking-[-0.02em] text-primary-foreground sm:text-4xl lg:text-[2.75rem]">
            Patients, in their own words
          </h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          <TestimonialCard testimonial={featured} featured className="lg:col-span-7" />
          {others.length > 0 && (
            <div className="grid gap-6 lg:col-span-5">
              {others.map((testimonial, index) => (
                <TestimonialCard key={testimonial.author} testimonial={testimonial} revealIndex={index + 1} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

function TestimonialCard({
  testimonial,
  featured = false,
  revealIndex = 0,
  className,
}: {
  testimonial: Testimonial;
  featured?: boolean;
  revealIndex?: number;
  className?: string;
}) {
  return (
    <figure
      data-reveal
      style={revealDelay(revealIndex, 120)}
      className={cn(
        "flex flex-col justify-between gap-8 rounded-3xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 sm:p-8",
        featured && "lg:p-12",
        className,
      )}
    >
      <div>
        <Quote
          aria-hidden="true"
          className={cn("text-primary-foreground/35", featured ? "size-10" : "size-7")}
        />
        <blockquote
          className={cn(
            "mt-5 leading-relaxed text-primary-foreground",
            featured ? "font-display text-2xl tracking-tight sm:text-3xl sm:leading-snug" : "text-base",
          )}
        >
          <p>“{testimonial.quote}”</p>
        </blockquote>
      </div>
      <figcaption className="border-t border-primary-foreground/10 pt-6 text-sm">
        <span className="block font-semibold text-primary-foreground">{testimonial.author}</span>
        <span className="mt-0.5 block text-primary-foreground/70">{testimonial.context}</span>
      </figcaption>
    </figure>
  );
}
