import type { Metadata } from "next";
import { ContactDetails } from "@/components/enquiry/contact-details";
import { EnquiryForm } from "@/components/enquiry/enquiry-form";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site.config";
import { getPreferredDateRange, isEnquiryServiceSlug } from "@/lib/enquiries/enquiry.schema";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata(siteConfig.pages.contact.seo, "/contact");

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
      <div className="border-b border-border bg-primary-soft">
        <Container className="py-12 sm:py-16">
          <SectionHeading as="h1" eyebrow={`${locality}, ${city}`} title={title} subtitle={subtitle} />
        </Container>
      </div>

      <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
        <EnquiryForm defaultService={defaultService} minDate={dateRange.min} maxDate={dateRange.max} />
        <ContactDetails />
      </Container>
    </>
  );
}
