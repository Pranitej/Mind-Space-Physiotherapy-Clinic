import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site.config";
import { revealDelay } from "@/lib/motion";

/** Home page: the clinic's values beside a treatment photo. */
export function ApproachSection() {
  const image = siteConfig.images.treatment;

  return (
    <section className="border-y border-border bg-surface">
      <Container className="grid items-center gap-14 py-20 lg:grid-cols-12 lg:gap-20 lg:py-28">
        <div data-reveal className="relative lg:col-span-5">
          <div className="aspect-3/2 overflow-hidden rounded-[2rem] bg-primary-soft shadow-lift lg:aspect-4/5">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 1152px) 420px, (min-width: 1024px) 38vw, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)"
              className="size-full object-cover object-[70%_50%]"
            />
          </div>
        </div>

        <div className="lg:col-span-7">
          <div data-reveal>
            <SectionHeading
              eyebrow="Our approach"
              title={`Why patients choose ${siteConfig.shortName}`}
              subtitle={`Helping ${siteConfig.contact.address.city} move better since ${siteConfig.foundedYear}, with the same principles from day one.`}
            />
          </div>
          <ul className="mt-10 divide-y divide-border border-y border-border">
            {siteConfig.values.map((value, index) => (
              <li key={value.title} data-reveal style={revealDelay(index)} className="flex gap-5 py-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <Icon name={value.icon} className="size-5" />
                </span>
                <div>
                  <h3 className="font-display text-xl tracking-tight text-primary">{value.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{value.description}</p>
                </div>
              </li>
            ))}
          </ul>
          <ButtonLink href="/about" variant="outline" className="mt-10">
            Meet our physiotherapists
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
