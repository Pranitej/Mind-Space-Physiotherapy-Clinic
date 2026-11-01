import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site.config";

/** About page: the clinic's values as a row of cards. */
export function ValuesGrid() {
  return (
    <section className="border-y border-border bg-surface">
      <Container className="py-20 lg:py-28">
        <SectionHeading title="What we stand for" align="center" />
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {siteConfig.values.map((value) => (
            <li key={value.title} className="rounded-3xl border border-border bg-background p-6 sm:p-8">
              <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                <Icon name={value.icon} className="size-6" />
              </span>
              <h3 className="mt-6 font-display text-xl text-primary">{value.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{value.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
