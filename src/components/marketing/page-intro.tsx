import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

interface PageIntroProps {
  title: string;
  subtitle?: string;
  /** Extra content under the heading, e.g. an in-page jump list. */
  children?: ReactNode;
}

/** Opening block of an inner page: owns the page's single h1. */
export function PageIntro({ title, subtitle, children }: PageIntroProps) {
  return (
    <header className="relative isolate overflow-hidden border-b border-border">
      <div
        aria-hidden="true"
        className="absolute -top-40 -right-32 -z-10 size-104 rounded-full bg-primary-soft sm:-top-48 sm:-right-24 sm:size-136"
      />
      <div
        aria-hidden="true"
        className="absolute top-24 right-40 -z-10 hidden size-40 rounded-full border border-primary/10 lg:block"
      />
      <Container className="py-14 sm:py-20 lg:py-24">
        <SectionHeading as="h1" title={title} subtitle={subtitle} className="max-w-3xl" />
        {children}
      </Container>
    </header>
  );
}
