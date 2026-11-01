import "server-only";
import { getAdminSessionForApi } from "@/lib/auth/dal";
import { HttpError } from "@/lib/http/errors";

/**
 * Session guard for admin route handlers. API routes are outside the proxy
 * matcher entirely, so this check (not the proxy) is what protects them.
 * Throwing lets `handleRouteError` produce the standard 401 envelope.
 */
export async function requireAdminApiSession() {
  const session = await getAdminSessionForApi();
  if (!session) {
    throw new HttpError(401, "UNAUTHORIZED", "Your session has expired. Please sign in again.");
  }
  return session;
}
