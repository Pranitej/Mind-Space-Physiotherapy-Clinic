import Image from "next/image";
import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/utils";
import { PageLink } from "./page-link";

type Tone = "default" | "inverse";

/** The clinic's emblem on its own. Decorative: always sits next to the clinic name. */
export function BrandLogoMark({ tone = "default", className }: { tone?: Tone; className?: string }) {
  const { logo } = siteConfig;
  return (
    <Image
      src={tone === "inverse" ? logo.markInverse : logo.mark}
      alt=""
      width={logo.size}
      height={logo.size}
      sizes="48px"
      className={cn("size-11 shrink-0", className)}
    />
  );
}

interface BrandWordmarkProps {
  /** "inverse" for primary-coloured backgrounds such as the footer. */
  tone?: Tone;
  className?: string;
}

/**
 * Emblem + name, set like the logo lockup: "Mind Space" over a small,
 * letter-spaced "PHYSIOTHERAPY CLINIC". Read together, the two lines are the
 * full clinic name, which is also the link's accessible name.
 */
export function BrandWordmark({ tone = "default", className }: BrandWordmarkProps) {
  const inverse = tone === "inverse";

  return (
    <PageLink href="/" className={cn("inline-flex min-h-11 items-center gap-2.5 rounded-xl", className)}>
      <BrandLogoMark tone={tone} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-lg font-semibold tracking-[-0.01em]",
            inverse ? "text-primary-foreground" : "text-primary",
          )}
        >
          {siteConfig.shortName}
        </span>{" "}
        {/* The space above keeps the accessible name "Mind Space Physiotherapy Clinic"; flex ignores it visually. */}
        <span
          className={cn(
            "mt-1 text-[0.625rem] font-semibold tracking-[0.2em] uppercase",
            inverse ? "text-primary-foreground/70" : "text-primary/70",
          )}
        >
          {siteConfig.descriptor}
        </span>
      </span>
    </PageLink>
  );
}
