import type { Metadata } from "next";
import { ClinicStory } from "@/components/marketing/clinic-story";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { PageIntro } from "@/components/marketing/page-intro";
import { StatsBand } from "@/components/marketing/stats-band";
import { TeamGrid } from "@/components/marketing/team-grid";
import { ValuesGrid } from "@/components/marketing/values-grid";
import { siteConfig } from "@/config/site.config";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata(siteConfig.pages.about.seo, "/about");

export default function AboutPage() {
  const { title, intro } = siteConfig.pages.about;

  return (
    <>
      <PageIntro title={title} subtitle={intro} />
      <ClinicStory />
      <ValuesGrid />
      <TeamGrid />
      <StatsBand className="pb-20 lg:pb-28" />
      <CtaBanner />
    </>
  );
}
