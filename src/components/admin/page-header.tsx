import type { ReactNode } from "react";

/** The page's single h1, plus an optional one-line description. */
export function AdminPageHeader({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-3xl text-primary">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
    </div>
  );
}
