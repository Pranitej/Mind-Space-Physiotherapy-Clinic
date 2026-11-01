import type { Metadata } from "next";
import { defaultOgImage } from "@/components/seo/og-image";
import { siteConfig } from "@/config/site.config";
import type { PageSeo } from "@/config/types";
import { getSiteUrl } from "@/lib/site-url";

// Next.js merges metadata shallowly: a page-level `openGraph` replaces the
// inherited one, image included, so every builder sets the image explicitly.
const baseOpenGraph = {
  type: "website" as const,
  siteName: siteConfig.name,
  locale: siteConfig.locale.ogLocale,
  images: [{ ...defaultOgImage }],
};

/** Site-wide defaults, used by the root layout. */
export function buildRootMetadata(): Metadata {
  return {
    metadataBase: getSiteUrl(),
    title: { default: siteConfig.seo.defaultTitle, template: siteConfig.seo.titleTemplate },
    description: siteConfig.description,
    keywords: [...siteConfig.seo.keywords],
    applicationName: siteConfig.name,
    category: "health",
    alternates: { canonical: "/" },
    openGraph: {
      ...baseOpenGraph,
      url: "/",
      title: siteConfig.seo.defaultTitle,
      description: siteConfig.description,
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.seo.defaultTitle,
      description: siteConfig.description,
      images: [defaultOgImage.url],
    },
    robots: { index: true, follow: true },
    // We render explicit tel: links; stop iOS from auto-linking other digits.
    formatDetection: { telephone: false, address: false, email: false },
  };
}

/**
 * Per-page metadata with a canonical URL and matching Open Graph / Twitter
 * tags. `path` is the route path, e.g. "/services".
 */
export function buildPageMetadata(seo: PageSeo, path: string): Metadata {
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: path },
    openGraph: { ...baseOpenGraph, url: path, title: seo.title, description: seo.description },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [defaultOgImage.url],
    },
  };
}

/** For private pages (admin): never indexed, never followed. */
export const noIndexMetadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
