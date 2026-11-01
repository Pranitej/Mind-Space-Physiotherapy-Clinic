import { Info, Phone } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FaqList } from "@/components/marketing/faq-list";
import { PageIntro } from "@/components/marketing/page-intro";
import { buildFaqStructuredData } from "@/components/seo/clinic-structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import { ServiceDetail } from "@/components/marketing/service-detail";
import { FAQ_SECTION_ID, ServiceJumpList } from "@/components/marketing/service-jump-list";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site.config";
import { formatIndianPhone } from "@/lib/format";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata(siteConfig.pages.services.seo, "/services");

export default async function ServicesPage() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const { title, subtitle, pricingNote } = siteConfig.pages.services;
  const { phoneE164 } = siteConfig.contact;

  return (
    <>
      <PageIntro title={title} subtitle={subtitle}>
        <ServiceJumpList />
      </PageIntro>

      <Container className="py-16 lg:py-24">
        <div className="space-y-6 lg:space-y-8">
          {siteConfig.services.map((service, index) => (
            <ServiceDetail key={service.slug} service={service} index={index} />
          ))}
        </div>
        <p className="mt-8 flex gap-3 rounded-2xl border border-border bg-surface p-5 text-sm leading-relaxed text-muted sm:p-6">
          <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          {pricingNote}
        </p>
      </Container>

      <section id={FAQ_SECTION_ID} className="scroll-mt-6 border-y border-border bg-surface">
        <Container className="grid gap-10 py-20 lg:grid-cols-12 lg:gap-16 lg:py-28">
          <div className="lg:col-span-4">
            <SectionHeading
              title="Frequently asked questions"
              subtitle="Straight answers about booking, your first visit and paying for treatment."
            />
            <p className="mt-6 text-muted">
              Still unsure?{" "}
              <a
                href={`tel:${phoneE164}`}
                className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary underline underline-offset-4"
              >
                <Phone aria-hidden="true" className="size-4" />
                Call {formatIndianPhone(phoneE164)}
              </a>
            </p>
          </div>
          <FaqList faqs={siteConfig.faqs} className="lg:col-span-8" />
          <JsonLd data={buildFaqStructuredData()} nonce={nonce} />
        </Container>
      </section>

      <CtaBanner className="pt-20 lg:pt-28" />
    </>
  );
}
