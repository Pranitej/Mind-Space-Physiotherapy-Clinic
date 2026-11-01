import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site.config";
import { FaqList } from "./faq-list";

const TEASER_COUNT = 3;

export function FaqTeaser() {
  return (
    <section>
      <Container className="grid gap-10 py-20 lg:grid-cols-12 lg:gap-16 lg:py-28">
        <div className="lg:col-span-5">
          <SectionHeading
            title="Questions, answered"
            subtitle="What patients most often ask us before their first visit."
          />
          <ButtonLink href="/services#faq" variant="outline" className="mt-8">
            All questions
            <ArrowRight aria-hidden="true" className="size-4" />
          </ButtonLink>
        </div>
        <FaqList faqs={siteConfig.faqs.slice(0, TEASER_COUNT)} className="lg:col-span-7" />
      </Container>
    </section>
  );
}
