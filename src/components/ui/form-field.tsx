import { CircleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one look for every text input, select and textarea on the site (the
 * enquiry form and the admin sign-in), 48px tall for comfortable touch:
 * a soft warm fill with a faint inset shadow that turns white on focus, and a
 * brand-coloured ring with a darker border in place of the global outline,
 * so focus stays clearly visible for keyboard users. Invalid fields go red.
 */
export const controlClasses = cn(
  "block min-h-12 w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-base text-foreground",
  "shadow-[inset_0_1px_2px_color-mix(in_oklab,var(--color-primary)_7%,transparent)] placeholder:text-muted/60",
  "transition-[border-color,box-shadow,background-color] duration-300 ease-smooth hover:border-primary/35",
  "focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10 focus:outline-none",
  "aria-invalid:border-danger aria-invalid:bg-danger/3 aria-invalid:hover:border-danger",
  "aria-invalid:focus:ring-danger/10",
);

/** Left padding for a control that has a ControlIcon. */
export const controlWithIconClasses = "pl-11";

/**
 * Decorative icon inside the start of a control (place both in a `relative`
 * wrapper). It takes the brand colour while the control has focus.
 */
export function ControlIcon({
  icon: IconComponent,
  align = "center",
}: {
  icon: LucideIcon;
  align?: "center" | "top";
}) {
  return (
    <IconComponent
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute left-4 size-4.5 text-muted transition-colors duration-300",
        "group-focus-within/field:text-primary",
        align === "center" ? "top-1/2 -translate-y-1/2" : "top-3.5",
      )}
    />
  );
}

export function RequiredMark() {
  return (
    <span aria-hidden="true" className="ml-0.5 text-danger">
      *
    </span>
  );
}

export function OptionalMark() {
  return <span className="ml-1.5 text-xs font-normal text-muted">(optional)</span>;
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      className="flex items-start gap-1.5 text-sm font-medium text-danger motion-safe:animate-drop-in"
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  );
}

/** ARIA wiring handed to the control so it is announced with its hint and error. */
export interface ControlAria {
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  "aria-required"?: true;
}

export function describedBy(...ids: Array<string | false | undefined>): string | undefined {
  const joined = ids.filter(Boolean).join(" ");
  return joined || undefined;
}

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  /** Marks the field "(optional)" next to its label. */
  optional?: boolean;
  hint?: ReactNode;
  error?: string;
  /** Extra ids to describe the control with (e.g. a character counter). */
  extraDescribedBy?: string;
  className?: string;
  children: (aria: ControlAria) => ReactNode;
}

/**
 * Label + control + hint + error, with ids derived from the control id so the
 * relationships can never be mis-wired. The control is rendered by the caller
 * (render prop) so it can be an input, select or textarea.
 *
 * The hint sits under the control, so controls side by side line up whether
 * or not they have one. The label takes the brand colour while its control
 * has focus.
 */
export function Field({
  id,
  label,
  required,
  optional,
  hint,
  error,
  extraDescribedBy,
  className,
  children,
}: FieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className={cn("group/field flex flex-col gap-2", className)}>
      <label
        htmlFor={id}
        className="text-sm font-semibold text-foreground transition-colors duration-300 group-focus-within/field:text-primary"
      >
        {label}
        {required && <RequiredMark />}
        {optional && <OptionalMark />}
      </label>
      {children({
        "aria-describedby": describedBy(
          hint ? hintId : undefined,
          extraDescribedBy,
          error ? errorId : undefined,
        ),
        "aria-invalid": error ? true : undefined,
        "aria-required": required ? true : undefined,
      })}
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      <FieldError id={errorId} message={error} />
    </div>
  );
}
