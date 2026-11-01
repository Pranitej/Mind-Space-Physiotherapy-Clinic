import { ArrowRight } from "lucide-react";
import { ButtonLink, buttonArrowClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site.config";
import { revealDelay } from "@/lib/motion";
import { ServiceCard } from "./service-card";

export function FeaturedServices() {
  const { title, subtitle } = siteConfig.pages.home.servicesIntro;
  const featured = siteConfig.services.filter((service) => service.featured);

  return (
    <section>
      <Container className="py-20 lg:py-28">
        <div data-reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow="Services" title={title} subtitle={subtitle} />
          <ButtonLink href="/services" variant="ghost" className="self-start px-4 sm:self-auto">
            All {siteConfig.services.length} services
            <ArrowRight aria-hidden="true" className={buttonArrowClasses} />
          </ButtonLink>
        </div>

        <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((service, index) => (
            <li
              key={service.slug}
              data-reveal
              style={revealDelay(index)}
              className="md:last:odd:col-span-2 lg:last:odd:col-span-1"
            >
              <ServiceCard service={service} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
