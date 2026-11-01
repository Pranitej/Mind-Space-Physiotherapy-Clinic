import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/auth/dal";

/**
 * Signed-in admin chrome. Checking the session here keeps the shell (and its
 * sign-out button) from ever rendering for a visitor without one. It is not
 * the only check: layouts are not re-run on client navigations between their
 * pages, so every page calls `requireAdminPage()` itself as well.
 */
export default async function AdminDashboardLayout({ children }: LayoutProps<"/admin">) {
  await requireAdminPage();
  return <AdminShell>{children}</AdminShell>;
}
