import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "inverse";
type Size = "sm" | "md" | "lg";

// group/button lets icons inside react to hover, e.g. an arrow that nudges forward.
const base =
  "group/button inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap " +
  "select-none transition-[background-color,border-color,color,box-shadow,transform] duration-300 " +
  "ease-smooth active:scale-[0.98] active:duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  // Accent is reserved for conversion actions (book / submit).
  primary: "bg-accent text-accent-foreground shadow-accent hover:-translate-y-px hover:bg-accent-hover",
  secondary: "bg-primary text-primary-foreground shadow-soft hover:-translate-y-px hover:bg-primary-hover",
  outline:
    "border border-primary/20 bg-surface text-primary shadow-soft hover:-translate-y-px hover:border-primary/40 " +
    "hover:bg-primary-soft/60",
  ghost: "text-primary hover:bg-primary-soft",
  inverse: "bg-surface text-primary hover:-translate-y-px hover:bg-primary-soft",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[0.95rem]",
  lg: "h-13 px-7 text-base",
};

/** Class for an arrow icon inside a button: nudges forward on hover. */
export const buttonArrowClasses =
  "size-4 transition-transform duration-300 ease-smooth group-hover/button:translate-x-1";

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}
