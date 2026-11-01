import type { Metadata } from "next";
import { ApproachSection } from "@/components/marketing/approach-section";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FaqTeaser } from "@/components/marketing/faq-teaser";
import { FeaturedServices } from "@/components/marketing/featured-services";
import { HomeHero } from "@/components/marketing/home-hero";
import { ProcessSteps } from "@/components/marketing/process-steps";
import { StatsBand } from "@/components/marketing/stats-band";
import { Testimonials } from "@/components/marketing/testimonials";
import { siteConfig } from "@/config/site.config";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata(siteConfig.pages.home.seo, "/");

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <StatsBand />
      <FeaturedServices />
      <ApproachSection />
      <ProcessSteps />
      <Testimonials />
      <FaqTeaser />
      <CtaBanner />
    </>
  );
}
