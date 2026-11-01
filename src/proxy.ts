import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session-token";
import { buildContentSecurityPolicy, generateNonce } from "@/lib/security/csp";

/**
 * Runs before every page render. Two responsibilities:
 *
 *  1. Per-request CSP nonce. The nonce is forwarded to the renderer through
 *     request headers (Next.js applies it to its own scripts automatically) and
 *     the matching policy is set on the response.
 *  2. Optimistic auth for /admin. Unauthenticated visitors are redirected to
 *     the login page before any rendering happens. This is a UX optimisation,
 *     not the security boundary — pages and APIs re-verify via `lib/auth/dal`.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdminArea) {
    const isLoginPage = pathname === "/admin/login";
    const session = await verifySessionToken(
      request.cookies.get(SESSION_COOKIE_NAME)?.value,
      process.env.SESSION_SECRET,
    );

    if (!session && !isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (session && isLoginPage) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  const nonce = generateNonce();
  const csp = buildContentSecurityPolicy({ nonce, isDev: process.env.NODE_ENV === "development" });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Pages only: skip API routes, Next.js assets, metadata files and anything with a file extension.
      source:
        "/((?!api/|_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|twitter-image|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.[\\w]+$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
