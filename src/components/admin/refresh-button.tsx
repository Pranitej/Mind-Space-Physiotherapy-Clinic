"use client";

import { RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Re-renders the current page on the server, e.g. after a transient database
 * error. Error boundaries pass their own `retry`, which also clears the boundary.
 */
export function RefreshButton({ onRetry }: { onRetry?: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-11"
      disabled={isPending}
      onClick={() => startTransition(() => (onRetry ? onRetry() : router.refresh()))}
    >
      <RotateCw aria-hidden="true" className={cn("size-4", isPending && "motion-safe:animate-spin")} />
      {isPending ? "Retrying…" : "Try again"}
    </Button>
  );
}
