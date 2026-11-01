/**
 * Canonical absolute URL of the site, used for metadata, sitemap and emails.
 *
 * Order of precedence:
 *  1. NEXT_PUBLIC_SITE_URL — set explicitly once a custom domain exists.
 *  2. VERCEL_PROJECT_PRODUCTION_URL — provided automatically by Vercel.
 *  3. localhost for development.
 */
export function getSiteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return new URL(`https://${vercel}`);

  return new URL(`http://localhost:${process.env.PORT ?? 3000}`);
}

export function absoluteUrl(path = "/"): string {
  return new URL(path, getSiteUrl()).toString();
}
