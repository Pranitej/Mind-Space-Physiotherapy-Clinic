import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { BrandLogoMark } from "@/components/layout/brand-wordmark";
import { siteConfig } from "@/config/site.config";
import { ADMIN_HOME_PATH } from "@/lib/admin/display";
import { getAdminSession } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function AdminLoginPage() {
  // The proxy already redirects signed-in visitors; repeating it here keeps the page correct without it.
  if (await getAdminSession()) redirect(ADMIN_HOME_PATH);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <BrandLogoMark className="size-12" />
          <div>
            <p className="text-lg leading-tight font-semibold text-primary">{siteConfig.name}</p>
            <p className="text-sm text-muted">{siteConfig.tagline}</p>
          </div>
        </div>

        <h1 className="mt-8 font-sans text-2xl font-semibold text-foreground">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted">
          For clinic staff. Enter the admin password to manage enquiries.
        </p>

        <LoginForm className="mt-6" />
      </div>

      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to website
      </Link>
    </main>
  );
}
