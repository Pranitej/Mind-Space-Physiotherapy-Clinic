import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  /** Heading level; defaults to h2 (each page owns exactly one h1). */
  as?: "h1" | "h2";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  as: Heading = "h2",
  className,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={cn("max-w-2xl", centered && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow centered={centered}>{eyebrow}</Eyebrow>}
      <Heading
        className={cn(
          "font-display leading-[1.1] tracking-[-0.02em] text-primary",
          Heading === "h1"
            ? "text-4xl sm:text-5xl lg:text-[3.5rem]"
            : "text-3xl sm:text-4xl lg:text-[2.75rem]",
        )}
      >
        {title}
      </Heading>
      {subtitle && (
        <p className={cn("mt-5 max-w-xl text-lg leading-relaxed text-muted", centered && "mx-auto")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/** Small label above a heading. Primary, not accent: the accent colour is reserved for booking actions. */
export function Eyebrow({
  children,
  centered = false,
  tone = "default",
}: {
  children: string;
  centered?: boolean;
  tone?: "default" | "inverse";
}) {
  const inverse = tone === "inverse";

  return (
    <p
      className={cn(
        "mb-4 flex items-center gap-3 text-xs font-semibold tracking-[0.16em] uppercase",
        inverse ? "text-primary-foreground/70" : "text-primary",
        centered && "justify-center",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-px w-6", inverse ? "bg-primary-foreground/40" : "bg-primary/40")}
      />
      {children}
    </p>
  );
}
