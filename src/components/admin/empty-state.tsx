import { Inbox } from "lucide-react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Inbox aria-hidden="true" className="size-6" />
      </span>
      <h3 className="mt-4 font-sans text-base font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted">{description}</p>
      {action && (
        <Link
          href={action.href}
          className={buttonClasses({ variant: "outline", size: "sm", className: "mt-5 h-11" })}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
