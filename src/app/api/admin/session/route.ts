import { NextResponse, type NextRequest } from "next/server";
import { siteConfig } from "@/config/site.config";
import { adminLoginSchema } from "@/lib/admin/schemas";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import { getServerEnv } from "@/lib/env";
import { HttpError } from "@/lib/http/errors";
import { handleRouteError, jsonError, validationError } from "@/lib/http/responses";
import { logger } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { assertSameOrigin, getClientIp, hashIp, readJsonBody } from "@/lib/security/request";

/**
 * Admin session: POST signs in, DELETE signs out.
 *
 * Login hardening, in order: same-origin check (CSRF) → per-IP rate limit →
 * size-capped JSON body → zod → scrypt verification in constant time. The
 * failure message is deliberately generic, and the password is never logged.
 * Logs carry only the keyed IP hash so repeated failures can be correlated.
 */
export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);

    const ipHash = hashIp(getClientIp(request));
    // Counted before the password is checked, so every guess spends the budget, right or wrong.
    await enforceRateLimit("admin-login", ipHash, siteConfig.security.rateLimits.adminLogin).catch(
      (error: unknown) => {
        if (error instanceof HttpError && error.status === 429) {
          logger.warn("admin.login_rate_limited", { ipHash });
        }
        throw error;
      },
    );

    const parsed = adminLoginSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) return validationError(parsed.error);

    const isValid = await verifyPassword(parsed.data.password, getServerEnv().ADMIN_PASSWORD_HASH);
    if (!isValid) {
      logger.warn("admin.login_failed", { ipHash });
      return jsonError(401, "UNAUTHORIZED", "Incorrect password.");
    }

    await createSession();
    logger.info("admin.login_succeeded", { ipHash });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error, "admin.login_error");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    assertSameOrigin(request);
    await deleteSession();
    logger.info("admin.logged_out");
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error, "admin.logout_error");
  }
}
