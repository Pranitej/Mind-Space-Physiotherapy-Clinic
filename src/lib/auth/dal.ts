import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSession } from "./session";

/**
 * Data Access Layer for authorisation.
 *
 * `proxy.ts` performs an optimistic cookie check for fast redirects, but it is
 * NOT the security boundary (proxy can be bypassed or misconfigured — see
 * CVE-2025-29927). Every server component and route handler that touches admin
 * data must call one of these helpers itself. `cache` dedupes the check within
 * a single render pass.
 */
export const getAdminSession = cache(readSession);

/** For server components/pages: redirects to the login page when unauthenticated. */
export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** For route handlers: returns the session or null so the handler can respond 401. */
export async function getAdminSessionForApi() {
  return readSession();
}
