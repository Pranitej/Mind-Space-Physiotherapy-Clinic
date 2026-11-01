"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { adminApi, describeLoginFailure } from "@/lib/admin/api-client";
import { ADMIN_HOME_PATH } from "@/lib/admin/display";
import { adminLoginSchema, type AdminLoginInput } from "@/lib/admin/schemas";
import { cn } from "@/lib/utils";

export function LoginForm({ className }: { className?: string }) {
  const router = useRouter();
  const inputId = useId();
  const fieldErrorId = `${inputId}-error`;
  const serverErrorId = `${inputId}-server-error`;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isRedirecting, startRedirect] = useTransition();

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { password: "" },
  });

  // Stays busy until the dashboard has loaded, so the form can't be resubmitted mid-redirect.
  const isBusy = isSubmitting || isRedirecting;
  const fieldError = errors.password?.message;
  const isInvalid = Boolean(fieldError || serverError);
  const describedBy = [fieldError && fieldErrorId, serverError && serverErrorId].filter(Boolean).join(" ");

  const onSubmit = handleSubmit(async ({ password }) => {
    setServerError(null);
    const result = await adminApi.signIn(password);
    if (result.ok) {
      startRedirect(() => {
        router.replace(ADMIN_HOME_PATH);
        router.refresh();
      });
      return;
    }
    setServerError(describeLoginFailure(result));
    setFocus("password", { shouldSelect: true });
  });

  return (
    <form onSubmit={onSubmit} noValidate className={cn("space-y-5", className)}>
      {/* Lets password managers save and fill the credential against a username. */}
      <input type="text" name="username" autoComplete="username" value="admin" readOnly hidden />

      <div>
        <label htmlFor={inputId} className="block text-sm font-semibold text-foreground">
          Password
        </label>
        <div className="relative mt-1.5">
          <input
            id={inputId}
            type={isPasswordVisible ? "text" : "password"}
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            aria-invalid={isInvalid || undefined}
            aria-describedby={describedBy || undefined}
            className={cn(
              "h-12 w-full rounded-lg border bg-surface pr-12 pl-3 text-base text-foreground",
              "focus-visible:outline-2 focus-visible:outline-offset-2",
              isInvalid ? "border-danger" : "border-border hover:border-primary/40",
            )}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-pressed={isPasswordVisible}
            aria-controls={inputId}
            className={cn(
              "absolute top-1/2 right-0.5 flex size-11 -translate-y-1/2 items-center justify-center rounded-md",
              "text-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-0",
            )}
          >
            {isPasswordVisible ? (
              <EyeOff aria-hidden="true" className="size-5" />
            ) : (
              <Eye aria-hidden="true" className="size-5" />
            )}
            <span className="sr-only">Show password</span>
          </button>
        </div>
        {fieldError && (
          <p id={fieldErrorId} className="mt-1.5 text-sm font-medium text-danger">
            {fieldError}
          </p>
        )}
      </div>

      <div>
        {/* Always mounted (and never display:none) so screen readers announce each new message. */}
        <div id={serverErrorId} role="alert">
          {serverError && (
            <p className="mb-4 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2.5 text-sm font-medium text-danger">
              {serverError}
            </p>
          )}
        </div>
        <Button type="submit" size="md" className="w-full" disabled={isBusy} aria-busy={isBusy || undefined}>
          {isBusy && <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />}
          {isBusy ? "Signing in…" : "Sign in"}
        </Button>
      </div>
    </form>
  );
}
