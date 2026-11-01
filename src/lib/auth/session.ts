import "server-only";
import { cookies } from "next/headers";
import { siteConfig } from "@/config/site.config";
import { getServerEnv, isProduction } from "@/lib/env";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  verifySessionToken,
  type SessionPayload,
} from "./session-token";

const { maxAgeSeconds } = siteConfig.security.session;

const cookieOptions = {
  httpOnly: true, // not readable from JavaScript → not stealable via XSS
  secure: isProduction, // HTTPS only in production
  sameSite: "strict", // never sent on cross-site requests → CSRF mitigation
  path: "/",
} as const;

/** Issues a new admin session cookie. Call only after the password is verified. */
export async function createSession(): Promise<void> {
  const token = await createSessionToken(getServerEnv().SESSION_SECRET, maxAgeSeconds);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, { ...cookieOptions, maxAge: maxAgeSeconds, priority: "high" });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  // Overwrite with the same attributes rather than cookies().delete(): browsers
  // ignore a `__Host-` cookie that is set without `Secure`, so a bare delete
  // would silently leave the session in place.
  cookieStore.set(SESSION_COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
}

export async function readSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token, getServerEnv().SESSION_SECRET);
}
