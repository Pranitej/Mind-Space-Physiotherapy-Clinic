import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site.config";
import { revealDelay } from "@/lib/motion";

/** About page: the clinic's values as a row of cards. */
export function ValuesGrid() {
  return (
    <section className="border-y border-border bg-surface">
      <Container className="py-20 lg:py-28">
        <div data-reveal>
          <SectionHeading eyebrow="Our values" title="What we stand for" align="center" />
        </div>
        <ul className="mt-14 grid gap-6 md:grid-cols-3">
          {siteConfig.values.map((value, index) => (
            <li key={value.title} data-reveal style={revealDelay(index)}>
              <div className="group card-lift h-full rounded-3xl border border-border bg-background p-6 sm:p-8">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary transition-colors duration-500 ease-smooth group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon name={value.icon} className="size-6" />
                </span>
                <h3 className="mt-6 font-display text-xl tracking-tight text-primary">{value.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{value.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
