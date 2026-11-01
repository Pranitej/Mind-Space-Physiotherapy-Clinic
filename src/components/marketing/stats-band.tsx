import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site.config";

/** Key figures as a definition list: label (dt) and value (dd), value shown first. */
export function StatsBand({ className }: { className?: string }) {
  return (
    <section aria-label="The clinic in numbers" className={className}>
      <Container>
        {/* gap-px over a border-coloured background draws hairline dividers at every breakpoint. */}
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border lg:grid-cols-4">
          {siteConfig.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse justify-end gap-2 bg-surface p-6 sm:p-8">
              <dt className="text-sm leading-snug text-muted">{stat.label}</dt>
              <dd className="font-display text-3xl text-primary sm:text-4xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
