import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site.config";
import { revealDelay } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { CountUp } from "./count-up";

/** Key figures as a definition list: label (dt) and value (dd), value shown first. */
export function StatsBand({ className }: { className?: string }) {
  return (
    <section aria-label="The clinic in numbers" className={className}>
      <Container>
        <dl className="grid grid-cols-2 gap-y-10 border-y border-border py-10 sm:py-12 lg:grid-cols-4">
          {siteConfig.stats.map((stat, index) => (
            <div
              key={stat.label}
              data-reveal
              style={revealDelay(index)}
              className={cn(
                "flex flex-col-reverse justify-end gap-2 pr-4",
                // Hairline dividers between columns: every second item on phones, every item but the first on desktop.
                "even:border-l even:border-border even:pl-6 lg:border-l lg:border-border lg:pl-8 lg:first:border-l-0 lg:first:pl-0",
              )}
            >
              <dt className="text-sm leading-snug text-muted">{stat.label}</dt>
              <dd className="font-display text-4xl tracking-tight text-primary tabular-nums sm:text-5xl">
                <CountUp value={stat.value} />
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
