import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site.config";

export function ProcessSteps() {
  const { title, steps } = siteConfig.pages.home.process;
  const { cta } = siteConfig.navigation;

  return (
    <section>
      <Container className="py-20 lg:py-28">
        <SectionHeading title={title} align="center" />

        <div className="relative mx-auto mt-14 max-w-5xl">
          {/* Connector through the step numbers (desktop): from the centre of the first column to the last. */}
          <div
            aria-hidden="true"
            className="absolute top-7 right-[16.66%] left-[16.66%] hidden h-px bg-primary/20 md:block"
          />
          <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-5 md:flex-col md:items-center md:text-center">
                <span className="grid size-14 shrink-0 place-items-center rounded-full border border-primary/20 bg-surface font-display text-xl text-primary">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-display text-2xl text-primary md:mt-4">{step.title}</h3>
                  <p className="mt-2 max-w-xs leading-relaxed text-muted">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-14 flex justify-center">
          <ButtonLink href={cta.href} size="lg">
            {cta.label}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
