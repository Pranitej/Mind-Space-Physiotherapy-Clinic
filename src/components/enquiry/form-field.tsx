import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared look for text inputs, selects and textareas (48px tall: comfortable touch target). */
export const controlClasses = cn(
  "block min-h-12 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-base text-foreground",
  "shadow-xs transition-colors duration-200 placeholder:text-muted/70 hover:border-primary/40",
  "focus-visible:border-primary aria-invalid:border-danger aria-invalid:hover:border-danger",
);

export function RequiredMark() {
  return (
    <span aria-hidden="true" className="ml-0.5 text-danger">
      *
    </span>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm font-medium text-danger">
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
 */
export function Field({
  id,
  label,
  required,
  hint,
  error,
  extraDescribedBy,
  className,
  children,
}: FieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
        {required && <RequiredMark />}
      </label>
      {hint && (
        <p id={hintId} className="-mt-1 text-sm text-muted">
          {hint}
        </p>
      )}
      {children({
        "aria-describedby": describedBy(
          hint ? hintId : undefined,
          extraDescribedBy,
          error ? errorId : undefined,
        ),
        "aria-invalid": error ? true : undefined,
        "aria-required": required ? true : undefined,
      })}
      <FieldError id={errorId} message={error} />
    </div>
  );
}
