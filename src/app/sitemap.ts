import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site.config";
import { absoluteUrl } from "@/lib/site-url";

type SitemapEntry = MetadataRoute.Sitemap[number];

/**
 * Public, indexable pages only: /admin and /api are deliberately absent (and
 * disallowed in robots.ts).
 *
 * `lastModified` is set only where the real date is known. Stamping every page
 * with the build time would change on every deploy, and search engines learn to
 * ignore a lastmod that is not accurate.
 */
const publicRoutes: ReadonlyArray<Omit<SitemapEntry, "url"> & { path: string }> = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/services", changeFrequency: "monthly", priority: 0.9 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.8 },
  { path: "/about", changeFrequency: "yearly", priority: 0.7 },
  {
    path: "/privacy",
    changeFrequency: "yearly",
    priority: 0.3,
    lastModified: siteConfig.pages.privacy.lastUpdated,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map(({ path, ...entry }) => ({ url: absoluteUrl(path), ...entry }));
}
