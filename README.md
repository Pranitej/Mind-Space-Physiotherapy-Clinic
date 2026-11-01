# MindSpace Therapy Centre — clinic website

A production-grade website for a (fictional) physiotherapy clinic in Jubilee Hills, Hyderabad: marketing
pages, an online enquiry/booking form backed by MongoDB with confirmation emails, and a password-protected
admin dashboard for the clinic owner.

**Live:** _add Vercel URL_ · **Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · MongoDB Atlas · Resend · Vercel

## Features

| Area                        | What it does                                                                                                                                                                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Pages**                   | Home, Services (fees, session lengths, FAQ), About (team, story), Contact/Booking, Privacy notice                                                                                                                                                                  |
| **Enquiry form**            | Validates as you type, using the same zod schema the server enforces. Accepts Indian mobile numbers in any common format and stores them as `+91…`. A service can be pre-selected from any "Book" button. The patient gets a reference number (`MS-YYMMDD-XXXXX`). |
| **Backend**                 | `POST /api/enquiries` → MongoDB Atlas. A confirmation email goes to the patient and a notification to the clinic through Resend, sent after the response so a slow email provider never blocks a booking. Delivery status is recorded per email.                   |
| **Admin**                   | `/admin`, behind a password. Summary counts, status filters, pagination and status updates (new → contacted → booked → closed). Desktop table and mobile cards.                                                                                                    |
| **SEO**                     | Per-page titles and descriptions, canonical URLs, Open Graph/Twitter cards with a generated share image, sitemap, robots.txt, web manifest and app icons. Structured data: `Physiotherapy` (LocalBusiness) and `FAQPage` JSON-LD.                                  |
| **Security**                | Strict nonce-based CSP, CSRF defences, rate limiting, scrypt password hashing, hardened session cookies and a full set of security headers. Details: [docs/SECURITY.md](docs/SECURITY.md).                                                                         |
| **Privacy (DPDP Act 2023)** | Explicit consent with a timestamp. IPs are stored only as keyed hashes and logs contain no personal data. Enquiries are deleted automatically after 12 months (MongoDB TTL index) unless the person becomes a patient.                                             |
| **One config file**         | [`src/config/site.config.ts`](src/config/site.config.ts) drives brand, contact details, services, prices, team, page copy, SEO, theme colours and security limits.                                                                                                 |

## Architecture at a glance

```
Browser ──► proxy.ts (CSP nonce, optimistic admin redirect)
        ├─► Server Components (pages) ──► Auth DAL ──┐
        └─► Route Handlers (/api/*) ──► origin check → rate limit → body limits → zod
                                         └─► Service layer ──► Repository ──► MongoDB Atlas
                                                         └─(after response)─► Resend
```

More detail, including request flows, the data model and the trade-offs, is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Getting started

Requirements: Node.js 22+, a MongoDB Atlas cluster (the free tier is fine) and optionally a Resend API key.

```bash
npm install
cp .env.example .env.local          # then fill in the values (see below)
npm run hash-password -- "a-strong-admin-password"   # paste the output into ADMIN_PASSWORD_HASH
npm run dev                          # http://localhost:3000  ·  admin: http://localhost:3000/admin
```

| Variable                    | Required | Notes                                                                                                              |
| --------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `MONGODB_URI`               | ✅       | Atlas connection string, for a user with `readWrite` on this database only                                         |
| `MONGODB_DB_NAME`           |          | Defaults to `mindspace`                                                                                            |
| `ADMIN_PASSWORD_HASH`       | ✅       | Output of `npm run hash-password`. The plain password is never stored                                              |
| `SESSION_SECRET`            | ✅       | 32+ random characters (signs admin sessions, keys IP hashes)                                                       |
| `RESEND_API_KEY`            |          | Without it, emails are **simulated** and logged instead of sent                                                    |
| `EMAIL_FROM`                |          | Defaults to `onboarding@resend.dev`, which only delivers to your Resend account's email until a domain is verified |
| `CLINIC_NOTIFICATION_EMAIL` |          | Inbox for new-enquiry notifications                                                                                |
| `NEXT_PUBLIC_SITE_URL`      |          | Canonical URL; detected automatically on Vercel                                                                    |

## Scripts

| Command                           | Purpose                                                                                                                           |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev` / `build` / `start` | Develop, build, serve                                                                                                             |
| `npm run check`                   | Lint, type-check and unit tests                                                                                                   |
| `npm test`                        | Vitest (~300 tests: validation, formatting, CSP, password hashing, sessions, request guards, admin API handlers, email rendering) |
| `npm run format`                  | Prettier, including Tailwind class sorting                                                                                        |
| `npm run hash-password -- "<pw>"` | Generate `ADMIN_PASSWORD_HASH`                                                                                                    |

CI (GitHub Actions) runs lint, type-check, tests, the production build and `npm audit` on every push and PR.

## Deploying to Vercel

1. Push to GitHub and import the repo in Vercel (framework preset: Next.js).
2. Add the environment variables above (Production and Preview).
3. In MongoDB Atlas → Network Access, allow `0.0.0.0/0`, because Vercel uses dynamic egress IPs. Rely on a least-privilege database user.
4. Deploy. After a custom domain is attached, set `NEXT_PUBLIC_SITE_URL`.

## Project structure

```
src/
  config/        site.config.ts (single source of truth) + types
  app/           routes: (marketing) pages, admin, api, metadata files (sitemap, robots, icons, OG image)
  components/    ui primitives, layout, marketing sections, enquiry form, admin, seo
  lib/           enquiries (schema/service/repository), auth, security, email, http, db, format
  proxy.ts       CSP nonce + optimistic admin redirect
docs/            ARCHITECTURE.md, SECURITY.md
```

## Notes

- **Demo content:** the clinic, staff and testimonials are fictional, and a footer notice says so (`features.demoNotice`). Photos are from Unsplash under its licence ([credits](public/images/CREDITS.md)).
- **Indian formats throughout:** +91 phone numbers, ₹ with Indian digit grouping, DD/MM/YYYY dates, IST, 6-digit PIN codes.
