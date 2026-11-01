import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

interface ErrorPanelProps {
  title: string;
  message: string;
  /** Shown so the owner can quote it when reporting a problem; matches the server log entry. */
  reference?: string;
  action?: ReactNode;
}

/** Inline failure state for a data section, so one failed query never blanks the whole admin. */
export function ErrorPanel({ title, message, reference, action }: ErrorPanelProps) {
  return (
    <div role="alert" className="rounded-xl border border-danger/30 bg-danger/5 p-5 sm:p-6">
      <div className="flex gap-3">
        <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-danger" />
        <div>
          <h2 className="font-sans text-base font-semibold text-danger">{title}</h2>
          <p className="mt-1 text-sm text-foreground">{message}</p>
          {reference && <p className="mt-2 font-mono text-xs text-muted">Error reference: {reference}</p>}
          {action && <div className="mt-4">{action}</div>}
        </div>
      </div>
    </div>
  );
}
