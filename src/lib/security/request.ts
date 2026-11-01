import "server-only";
import { createHmac } from "node:crypto";
import type { NextRequest } from "next/server";
import { siteConfig } from "@/config/site.config";
import { getServerEnv } from "@/lib/env";
import { HttpError } from "@/lib/http/errors";

/**
 * Client IP for rate limiting. On Vercel, `x-forwarded-for` is set by the
 * platform edge (client-supplied values are overwritten), so the first entry
 * is trustworthy. Self-hosting behind another proxy requires revisiting this.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Keyed hash of the client IP. Lets us rate-limit and spot abuse without
 * storing raw IP addresses (personal data under the DPDP Act).
 */
export function hashIp(ip: string): string {
  return createHmac("sha256", getServerEnv().SESSION_SECRET).update(ip).digest("hex").slice(0, 32);
}

/**
 * CSRF defence for state-changing requests (in addition to SameSite=Strict
 * cookies): the request must come from our own origin. Browsers always send
 * `Origin` on POST/PATCH/DELETE; `Sec-Fetch-Site` is the fallback signal.
 * Requests with neither (e.g. scripts) are rejected — this API only serves
 * the site's own frontend.
 */
export function assertSameOrigin(request: NextRequest): void {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  if (origin) {
    let originHost: string;
    try {
      originHost = new URL(origin).host;
    } catch {
      throw new HttpError(403, "FORBIDDEN", "Cross-origin request blocked.");
    }
    if (host && originHost === host) return;
    throw new HttpError(403, "FORBIDDEN", "Cross-origin request blocked.");
  }

  if (request.headers.get("sec-fetch-site") === "same-origin") return;
  throw new HttpError(403, "FORBIDDEN", "Cross-origin request blocked.");
}

/**
 * Reads and parses a JSON body defensively: enforces the content type and a
 * maximum size before parsing, so oversized or malformed payloads are
 * rejected cheaply.
 */
export async function readJsonBody(
  request: NextRequest,
  maxBytes: number = siteConfig.security.maxRequestBodyBytes,
): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new HttpError(415, "UNSUPPORTED_MEDIA_TYPE", "Expected an application/json request body.");
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > maxBytes) {
    throw new HttpError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
  }

  // Content-Length can be absent or wrong (chunked encoding), so check the real size too.
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw new HttpError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new HttpError(400, "BAD_REQUEST", "Request body is not valid JSON.");
  }
}
