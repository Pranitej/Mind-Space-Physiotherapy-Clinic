"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/admin/api-client";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/display";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await adminApi.signOut();
      if (!result.ok) {
        setError("Couldn't sign out. Please try again.");
        return;
      }
      router.replace(ADMIN_LOGIN_PATH);
      // Drop cached admin pages so Back can't show them after signing out.
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" className="h-11" onClick={handleClick} disabled={isPending}>
        <LogOut aria-hidden="true" className="size-4" />
        {isPending ? "Signing out…" : "Sign out"}
      </Button>
      {error && (
        <p
          role="alert"
          className="absolute top-full right-0 z-10 mt-2 w-56 rounded-lg border border-danger/30 bg-surface p-2 text-xs font-medium text-danger shadow-sm"
        >
          {error}
        </p>
      )}
    </div>
  );
}
