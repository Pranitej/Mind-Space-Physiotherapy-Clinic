import Image from "next/image";
import Link from "next/link";
import { brandMarkDataUri } from "@/components/seo/brand-mark";
import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/utils";

interface BrandWordmarkProps {
  /** "inverse" for primary-coloured backgrounds such as the footer. */
  tone?: "default" | "inverse";
  className?: string;
}

const { colors } = siteConfig.theme;

// The same mark geometry as the favicon, app icons and social image (one
// definition in brand-mark.ts), drawn on a transparent background.
const markSrc = {
  default: brandMarkDataUri({ backgroundColor: null, markColor: colors.primary, scale: 1.2 }),
  inverse: brandMarkDataUri({ backgroundColor: null, markColor: colors.primaryForeground, scale: 1.2 }),
};

/** Logo mark + clinic name + tagline, linking to the home page. */
export function BrandWordmark({ tone = "default", className }: BrandWordmarkProps) {
  const inverse = tone === "inverse";

  return (
    <Link href="/" className={cn("inline-flex min-h-11 items-center gap-2.5 rounded-xl", className)}>
      {/* Decorative: the clinic name beside it is the link's accessible name. */}
      <Image src={markSrc[tone]} alt="" width={40} height={40} unoptimized className="size-10 shrink-0" />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-base font-semibold tracking-tight sm:text-lg",
            inverse ? "text-primary-foreground" : "text-primary",
          )}
        >
          {siteConfig.name}
        </span>
        <span
          className={cn(
            "mt-1.5 text-xs font-medium tracking-wide",
            inverse ? "text-primary-foreground/75" : "text-muted",
          )}
        >
          {siteConfig.tagline}
        </span>
      </span>
    </Link>
  );
}
