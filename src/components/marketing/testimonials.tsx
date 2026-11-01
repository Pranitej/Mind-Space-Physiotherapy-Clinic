import { Quote } from "lucide-react";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site.config";
import type { Testimonial } from "@/config/types";
import { cn } from "@/lib/utils";

/** One featured quote and the rest stacked beside it, on the brand colour for contrast with the page. */
export function Testimonials() {
  const [featured, ...others] = siteConfig.testimonials;
  if (!featured) return null;

  return (
    <section className="bg-primary text-primary-foreground">
      <Container className="py-20 lg:py-28">
        <h2 className="max-w-2xl font-display text-3xl text-primary-foreground sm:text-4xl">
          Patients, in their own words
        </h2>

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          <TestimonialCard testimonial={featured} featured className="lg:col-span-7" />
          {others.length > 0 && (
            <div className="grid gap-6 lg:col-span-5">
              {others.map((testimonial) => (
                <TestimonialCard key={testimonial.author} testimonial={testimonial} />
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
  className,
}: {
  testimonial: Testimonial;
  featured?: boolean;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "flex flex-col justify-between gap-8 rounded-3xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 sm:p-8",
        featured && "lg:p-12",
        className,
      )}
    >
      <div>
        <Quote
          aria-hidden="true"
          className={cn("text-primary-foreground/40", featured ? "size-10" : "size-7")}
        />
        <blockquote
          className={cn(
            "mt-5 leading-relaxed text-primary-foreground",
            featured ? "font-display text-2xl sm:text-3xl sm:leading-snug" : "text-base",
          )}
        >
          <p>“{testimonial.quote}”</p>
        </blockquote>
      </div>
      <figcaption className="text-sm">
        <span className="block font-semibold text-primary-foreground">{testimonial.author}</span>
        <span className="mt-0.5 block text-primary-foreground/75">{testimonial.context}</span>
      </figcaption>
    </figure>
  );
}
