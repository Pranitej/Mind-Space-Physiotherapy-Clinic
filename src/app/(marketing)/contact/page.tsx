import type { Metadata } from "next";
import { ClinicInfo, QuickContact } from "@/components/enquiry/contact-details";
import { EnquiryForm } from "@/components/enquiry/enquiry-form";
import { PageIntro } from "@/components/marketing/page-intro";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site.config";
import { getPreferredDateRange, isEnquiryServiceSlug } from "@/lib/enquiries/enquiry.schema";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata(siteConfig.pages.contact.seo, "/contact");

/**
 * One column, top to bottom: heading with direct contact options, the form,
 * then visiting details. Nothing competes with the form for attention.
 */
export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const { service } = await searchParams;
  // "Book" links on service pages pass ?service=<slug>. Anything that is not a
  // known slug (including repeated params) is ignored rather than trusted.
  const defaultService = typeof service === "string" && isEnquiryServiceSlug(service) ? service : undefined;
  const dateRange = getPreferredDateRange();
  const { title, subtitle } = siteConfig.pages.contact;
  const { locality, city } = siteConfig.contact.address;

  return (
    <>
      <PageIntro eyebrow={`${locality}, ${city}`} title={title} subtitle={subtitle} align="center">
        <QuickContact />
      </PageIntro>

      <Container className="py-14 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <EnquiryForm defaultService={defaultService} minDate={dateRange.min} maxDate={dateRange.max} />
        </div>
      </Container>

      <ClinicInfo />
    </>
  );
}
