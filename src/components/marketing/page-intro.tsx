import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

interface PageIntroProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  align?: "left" | "center";
  /** Extra content under the heading, e.g. an in-page jump list. */
  children?: ReactNode;
}

/** Opening block of an inner page: owns the page's single h1. Same look on every inner page. */
export function PageIntro({ title, subtitle, eyebrow, align = "left", children }: PageIntroProps) {
  return (
    <header className="relative isolate overflow-hidden border-b border-border">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_90%_at_90%_0%,var(--color-primary-soft),transparent_70%)]" />
        <div className="dot-grid absolute inset-0 opacity-60" />
      </div>
      <Container className={cn("py-16 sm:py-20 lg:py-24", align === "center" && "text-center")}>
        <div className="motion-safe:animate-rise">
          <SectionHeading
            as="h1"
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
            align={align}
            className="max-w-3xl"
          />
        </div>
        {children && (
          <div className="motion-safe:animate-rise motion-safe:[animation-delay:120ms]">{children}</div>
        )}
      </Container>
    </header>
  );
}
