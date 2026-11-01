import type { MetadataRoute } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/site-url";

/**
 * Keeps crawlers out of the admin dashboard and the JSON API. This is crawl
 * hygiene, not access control: admin pages are protected by authentication
 * and additionally send `X-Robots-Tag: noindex` (next.config.ts).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getSiteUrl().origin,
  };
}
