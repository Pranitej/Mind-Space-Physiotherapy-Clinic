/**
 * Builds the Content-Security-Policy for HTML responses.
 *
 * Strict, nonce-based policy: only scripts carrying the per-request nonce (and
 * scripts they load, via 'strict-dynamic') can execute, so an injected
 * <script> tag or inline event handler is blocked even if markup injection
 * ever slipped through React's escaping.
 *
 * Kept free of Node/server-only imports because it runs inside `proxy.ts`.
 */
export function buildContentSecurityPolicy({ nonce, isDev }: { nonce: string; isDev: boolean }): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // 'unsafe-eval' is needed only by React's dev-mode error overlay.
    "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(isDev ? ["'unsafe-eval'"] : [])],
    // <style>/<link> elements must be same-origin or carry the nonce.
    // Dev needs 'unsafe-inline' for hot-reloaded styles.
    "style-src": ["'self'", isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`],
    "style-src-elem": ["'self'", isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`],
    // style="" attributes (used by next/image) cannot carry a nonce. They can't
    // execute code, so allowing them is a deliberate, low-risk trade-off.
    "style-src-attr": ["'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'"],
    "connect-src": ["'self'", ...(isDev ? ["ws:"] : [])],
    "manifest-src": ["'self'"],
    "frame-src": ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };

  const policy = Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
    .join("; ");

  // Upgrading would break plain-http localhost during development.
  return isDev ? policy : `${policy}; upgrade-insecure-requests`;
}

/** Cryptographically random, base64-encoded nonce (Web Crypto: works in any runtime). */
export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}
