# Security

This site stores personal and potentially health-related data (enquiries from patients) and exposes an admin
area. The controls below are designed around that threat model and are layered so that no single
mechanism is a single point of failure.

## Threat model → controls

| Threat                              | Control                                                                                                                                                                                                                                                                                    | Where                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| **XSS / script injection**          | Strict nonce-based Content-Security-Policy (`script-src 'self' 'nonce-…' 'strict-dynamic'`, no `'unsafe-inline'` for scripts), generated per request. React escapes all output; the only inline script is JSON-LD, which is serialised with `<` escaped.                                   | `src/proxy.ts`, `src/lib/security/csp.ts`                      |
| **Clickjacking**                    | `frame-ancestors 'none'` + `X-Frame-Options: DENY`.                                                                                                                                                                                                                                        | `csp.ts`, `next.config.ts`                                     |
| **CSRF**                            | Admin cookie is `SameSite=Strict`; every state-changing API call also verifies the `Origin` header (fallback `Sec-Fetch-Site`) and requires `Content-Type: application/json`, which cannot be sent cross-site without a CORS preflight that the API never approves.                        | `src/lib/security/request.ts`                                  |
| **Credential theft / brute force**  | Admin password stored only as a **scrypt** hash (memory-hard KDF) and compared in constant time. Login is rate-limited per IP (5 per 15 min), errors are generic, and scrypt makes each guess expensive.                                                                                   | `src/lib/auth/password.ts`, `src/app/api/admin/session`        |
| **Session hijacking**               | Session is a short-lived (8 h) HS256 JWT with pinned algorithm, issuer, audience and subject. Stored in an `httpOnly`, `Secure`, `SameSite=Strict` cookie with the `__Host-` prefix (no `Domain`, path `/`, HTTPS only), so it cannot be read by JavaScript or set by a sibling subdomain. | `src/lib/auth/session-token.ts`, `session.ts`                  |
| **Broken access control**           | `proxy.ts` only does an optimistic redirect. **Every** admin page and admin API route re-verifies the session itself through the Data Access Layer, so a proxy bypass (cf. CVE-2025-29927) exposes nothing.                                                                                | `src/lib/auth/dal.ts`                                          |
| **Injection into MongoDB**          | All input is parsed by strict zod schemas (types, lengths, enums, formats) before reaching the database, so operator objects such as `{ "$gt": "" }` can never reach a query. Ids are checked against a strict 24-hex pattern.                                                             | `src/lib/enquiries/enquiry.schema.ts`, `enquiry.repository.ts` |
| **Spam & abuse of the public form** | Per-IP rate limit (5 enquiries/hour) backed by MongoDB, so limits hold across serverless instances. A honeypot field silently drops bots without revealing detection.                                                                                                                      | `src/lib/security/rate-limit.ts`, `src/app/api/enquiries`      |
| **Resource exhaustion**             | JSON bodies are capped at 10 KB (declared _and_ actual size checked before parsing); MongoDB pool size is bounded; email sending is moved off the request path with `after()`.                                                                                                             | `request.ts`, `mongodb.ts`                                     |
| **Email header injection**          | Subjects are stripped of CR/LF; templates are React components (auto-escaped).                                                                                                                                                                                                             | `src/lib/email`                                                |
| **Secret leakage**                  | Secrets live only in environment variables, validated at runtime with zod; server modules import `server-only` so they cannot be bundled into client code; errors return a generic message and never a stack trace.                                                                        | `src/lib/env.ts`, `src/lib/http/responses.ts`                  |
| **Information disclosure**          | `X-Powered-By` removed; admin pages are `noindex` + `Cache-Control: private, no-store`; API responses are `no-store` with `default-src 'none'`.                                                                                                                                            | `next.config.ts`                                               |
| **Transport security**              | HSTS (2 years, `includeSubDomains`, `preload`), `upgrade-insecure-requests`, MongoDB Atlas TLS by default.                                                                                                                                                                                 | `next.config.ts`                                               |
| **Cross-origin leaks**              | `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin`, strict `Referrer-Policy`, restrictive `Permissions-Policy`.                                                                                                                                        | `next.config.ts`                                               |
| **Supply chain**                    | Lockfile committed, CI runs `npm audit --omit=dev --audit-level=high`, minimal dependency set.                                                                                                                                                                                             | `.github/workflows/ci.yml`                                     |

## Privacy (India — DPDP Act, 2023)

- **Consent:** the enquiry form needs an explicit consent checkbox; the consent timestamp is stored with the enquiry.
- **Data minimisation:** only the fields needed to call the patient back are collected. The confirmation email doesn't echo the free-text message back.
- **No raw IPs stored:** client IPs are kept only as a keyed HMAC-SHA256 hash, used for rate limiting and abuse investigation.
- **Logs contain no personal data:** structured logs reference enquiries by their reference number. The logger also redacts sensitive-looking keys as a safety net.
- **Storage limitation:** enquiries are deleted automatically 12 months after receipt by a MongoDB TTL index, unless the person becomes a patient. The retention period comes from `siteConfig.privacy`, which the privacy notice also quotes.
- **Transparency:** a privacy notice at `/privacy` explains the purpose, the processors, retention and the user's rights.

## Operational checklist (production)

- [ ] Generate `SESSION_SECRET` with at least 48 random bytes, and the admin hash with `npm run hash-password`.
- [ ] MongoDB Atlas: a dedicated database user with `readWrite` on this database only. Network access: Vercel uses dynamic egress IPs, so either allow `0.0.0.0/0` with strong credentials or use Atlas private networking on a paid tier.
- [ ] Resend: verify the clinic's sending domain (SPF/DKIM) and set `EMAIL_FROM` to an address on it.
- [ ] Set `NEXT_PUBLIC_SITE_URL` once a custom domain is attached.
- [ ] Rotating `SESSION_SECRET` invalidates all admin sessions immediately (the incident-response "log everyone out" switch).

## Known limitations and next steps

- One shared admin password. Next steps: per-user accounts with roles, TOTP 2FA and an audit log of admin actions.
- No CAPTCHA. Cloudflare Turnstile could be added if spam gets past the honeypot and rate limit.
- Rate-limit windows are fixed windows. A sliding window, or Upstash Redis at higher traffic, would smooth bursts.
- No CSP violation reporting yet. A `report-to` endpoint would surface violations in production.
- Login attempts are rate-limited per IP; a distributed brute force across many IPs would need account-level lockout or 2FA (see above).
