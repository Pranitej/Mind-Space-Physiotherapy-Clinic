# Mind Space Physiotherapy Clinic: project highlights

**Live:** https://mind-space-physiotherapy-clinic.vercel.app · **Admin:** `/admin` ·
**Code:** https://github.com/Pranitej/Mind-Space-Physiotherapy-Clinic

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · MongoDB Atlas · Resend · Vercel

---

## Overview

A website and booking system for a physiotherapy clinic in Jubilee Hills, Hyderabad (the clinic is fictional).
Patients can browse services and prices, then send a booking request from any page. The clinic owner manages
every enquiry from a password-protected dashboard. Because the site collects patient data, security and
privacy are part of the design from the start, not added at the end.

---

## 1. Built around the business goal: more bookings

- **A booking button on every page**, in a sticky header, plus a WhatsApp shortcut.
- **Service cards show** a short summary, session length and price in ₹, with a direct "Book" link.
- **"Book" on a service pre-fills the form** with that service (`/contact?service=<slug>`).
- **A short form that validates as you type.** It accepts Indian mobile numbers in any common format and
  stores them as `+91…`. The patient gets a reference number like `MS-261101-7K3QX`. References skip 0/O and
  1/I/L, so they're easy to read out over the phone.
- **A confirmation email to the patient and an alert to the clinic** for every enquiry.
- **Indian formats throughout:** ₹ with Indian digit grouping, +91, DD/MM/YYYY, IST and 6-digit PIN codes.
- **Today's opening hours**, worked out in the clinic's time zone (not the server's or the visitor's).

## 2. One config file drives the whole site

[`src/config/site.config.ts`](src/config/site.config.ts) holds the brand, contact details, services, prices,
team, page copy, SEO, theme colours and security limits. Rebranding the site for another clinic means editing
one file. Even the colours flow from this config into CSS variables ([`src/lib/theme.ts`](src/lib/theme.ts)).
Secrets are deliberately kept out of it; they live in environment variables.

## 3. A clean, layered architecture

```
Browser ─► proxy.ts (CSP nonce, admin redirect)
        ├─► Pages (Server Components) ─► Auth check ─┐
        └─► API routes ─► origin check → rate limit → size check → zod
                              └─► Service ─► Repository ─► MongoDB
                                      └─(after the response)─► Resend email
```

- **Route handlers stay thin.** They only deal with HTTP; the business logic lives in the service layer
  ([`enquiry.service.ts`](src/lib/enquiries/enquiry.service.ts)).
- **Only the repository talks to the database** ([`enquiry.repository.ts`](src/lib/enquiries/enquiry.repository.ts)).
- **One zod schema validates the form in the browser and the request on the server**
  ([`enquiry.schema.ts`](src/lib/enquiries/enquiry.schema.ts)), so the two rule sets can't drift apart.
- **Server Components by default.** Pages and layouts render on the server. `"use client"` is used only on
  small interactive pieces (the form, navigation, animations, admin controls), so little JavaScript reaches
  the browser.
- **Only 14 runtime dependencies.** The animations use CSS and small components rather than an animation
  library, and they respect the "reduce motion" setting.

## 4. A booking never fails because of email

Emails are sent **after** the response with Next.js `after()`
([`src/app/api/enquiries/route.ts`](src/app/api/enquiries/route.ts)). A slow or failing email provider can't
block or break a patient's booking. Each delivery result (`sent`, `failed`, `skipped`, `simulated`) is saved on
the enquiry and shown in the admin, so staff know whether the patient was actually emailed. Each email carries
an idempotency key, so a retried send within 24 hours can't email someone twice.

## 5. Admin dashboard

- **Summary counts, search, filters and sorting.** Search covers name, email, reference, message and phone
  digits. Filters cover status, service and date received.
- **Status workflow:** new → contacted → booked → closed, with an instant (optimistic) UI update.
- **The current view lives in the URL**, so it can be reloaded, bookmarked or shared. The filters are a plain
  form, so they work without JavaScript.
- **A desktop table and mobile cards.**

## 6. Security

Full threat model: [`docs/SECURITY.md`](docs/SECURITY.md).

| Threat                | What I did                                                                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| XSS                   | **A strict, nonce-based Content-Security-Policy**, generated per request ([`csp.ts`](src/lib/security/csp.ts)). No `unsafe-inline` scripts.   |
| CSRF                  | `SameSite=Strict` cookie, an `Origin` header check, and JSON-only requests ([`request.ts`](src/lib/security/request.ts)).                     |
| Password attacks      | scrypt hashing with a constant-time compare. Login is limited to **5 attempts per 15 minutes** per IP.                                        |
| Session theft         | An 8-hour signed JWT in an `httpOnly`, `Secure` cookie (`__Host-` prefixed in production), so JavaScript can't read it.                       |
| Broken access control | **Every** admin page and API route re-checks the session itself ([`dal.ts`](src/lib/auth/dal.ts)), so bypassing the proxy exposes nothing.    |
| Database injection    | Strict zod parsing before any query, so payloads like `{ "$gt": "" }` never reach MongoDB.                                                    |
| Spam                  | **5 enquiries per hour** per IP, rate-limited in MongoDB so it holds across serverless instances. A hidden honeypot field drops bots quietly. |
| Oversized requests    | Request bodies are capped at 10 KB, checking both the declared and the actual size.                                                           |
| Leaked secrets        | Environment variables are validated with zod; `server-only` imports stop secret-handling code reaching the browser.                           |
| Headers               | HSTS, X-Frame-Options, COOP/CORP, Referrer-Policy and Permissions-Policy; `X-Powered-By` removed.                                             |

## 7. Privacy: India's DPDP Act, 2023

- **Explicit consent** checkbox, with the consent time stored on each enquiry.
- **No raw IP addresses are stored**, only a keyed hash.
- **Logs contain no personal data.** Enquiries are referred to by their reference number, and the logger
  redacts sensitive-looking fields as a safety net ([`logger.ts`](src/lib/logger.ts)).
- **Enquiries are deleted automatically after 12 months** by a MongoDB TTL index, with no cron job. Enquiries
  from people who became patients are kept. The privacy page quotes the same config value, so the promise and
  the enforcement can't drift apart.

## 8. SEO and performance

- Per-page titles and descriptions, canonical URLs, a generated Open Graph share image, a sitemap,
  robots.txt, a web manifest and app icons.
- **Structured data** (`Physiotherapy` LocalBusiness and `FAQPage` JSON-LD), so search engines understand the
  business.
- Self-hosted fonts, AVIF/WebP images and little client JavaScript.

## 9. Quality

- **328 unit tests** (Vitest), covering validation, Indian formatting, CSP, password hashing, sessions,
  request guards, the admin API and email rendering.
- **CI on every push** (GitHub Actions): lint, type-check, tests, production build and a dependency audit.
- Strict TypeScript, ESLint and Prettier. Design decisions are written down in
  [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Trade-offs

1. **Security over static pages.** A nonce-based CSP needs a fresh nonce on every page, so pages are rendered
   per request instead of cached as static HTML. The site collects patient data and has an admin area, so I
   chose the stronger policy. It stays fast anyway: light Server Components, optimised images and fonts, and
   static assets served from the CDN.
2. **Simple search instead of a search engine.** The admin search uses regex, which can't use an index. That's
   fine at a clinic's volume with 12-month retention; at scale I'd move to Atlas Search.
3. **One admin password instead of user accounts.** That's right for one clinic owner. Accounts with roles
   are the first upgrade (see below).
4. **No state library (Redux/Zustand).** There's no shared client state; the database is the single source of
   truth, and pages refresh from the server.

## With more time

- Per-user admin accounts with roles, two-factor login and an audit log.
- A real appointment calendar with slot availability, instead of a "preferred date and time" request.
- WhatsApp or SMS confirmations, and reminders the day before.
- Cloudflare Turnstile if spam gets past the honeypot and the rate limit.
- CSP violation reporting, and hash-based CSP to bring back static pages for the marketing site.
- End-to-end tests (Playwright) for the booking and admin flows.

---

## Why these choices

- **Next.js:** one codebase and one deploy for the pages and the API. Server Components ship little
  JavaScript, and the SEO tooling is built in.
- **MongoDB:** an enquiry is naturally a document, and the free Atlas tier suits a small clinic. TTL indexes
  handle both rate limiting and automatic data deletion without background jobs.
- **Resend:** a simple API with idempotency keys. The email templates are typed React components that share
  the site's config.
- **Spam protection:** per-IP rate limiting stored in MongoDB, plus a hidden honeypot field. CAPTCHA is the
  next step if needed.
- **If the email provider is down:** the booking is still saved and the patient still gets a reference
  number. The failure is recorded in the admin, so staff can call the patient.
- **Reusing it for another clinic:** edit `site.config.ts` and set the environment variables.

## Walkthrough

1. **Home page:** design, booking buttons, WhatsApp shortcut, mobile view.
2. **Services:** prices and session lengths, then "Book" on a service (the form arrives pre-filled).
3. **Contact:** live validation and Indian phone formats. Submit, and see the reference number.
4. **Admin:** log in and find the new enquiry with search. Change its status and try the URL-based filters.
5. **Code:** `site.config.ts`, the enquiry API route, `csp.ts`, `dal.ts`, then the CI runs on GitHub.

## Known limitation

The demo sends email through Resend's test sender (`onboarding@resend.dev`), which only delivers to the
account owner's address until a domain is verified. A confirmation sent to any other address is recorded as
**failed** in the admin, which shows the delivery tracking at work. For production, the fix is to verify the
clinic's domain (SPF/DKIM) and update one environment variable.
