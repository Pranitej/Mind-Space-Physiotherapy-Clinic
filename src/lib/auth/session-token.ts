import { jwtVerify, SignJWT } from "jose";

/**
 * Stateless admin session token (HS256 JWT).
 *
 * This module has no Node-only or `server-only` imports so it can run inside
 * `proxy.ts` as well as in route handlers and server components. Cookie
 * handling lives in `session.ts`.
 */
export const SESSION_ISSUER = "mindspace-website";
export const SESSION_AUDIENCE = "mindspace-admin";
const SESSION_SUBJECT = "admin";

export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? // `__Host-` prefix: browser enforces Secure, Path=/ and no Domain attribute,
      // so the cookie cannot be set or shadowed by a sibling subdomain.
      "__Host-mindspace_admin"
    : "mindspace_admin";

export interface SessionPayload {
  sub: typeof SESSION_SUBJECT;
  expiresAt: Date;
}

function getKey(secret: string) {
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(secret: string, maxAgeSeconds: number): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(SESSION_SUBJECT)
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(getKey(secret));
}

/** Returns the session payload, or null for a missing/invalid/expired token. */
export async function verifySessionToken(
  token: string | undefined,
  secret: string | undefined,
): Promise<SessionPayload | null> {
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(secret), {
      algorithms: ["HS256"], // pin the algorithm: rejects `alg: none` and key-confusion tokens
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
      subject: SESSION_SUBJECT,
    });
    if (typeof payload.exp !== "number") return null;
    return { sub: SESSION_SUBJECT, expiresAt: new Date(payload.exp * 1000) };
  } catch {
    return null;
  }
}
