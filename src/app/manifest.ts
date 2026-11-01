import type { MetadataRoute } from "next";
import { appIconUrl, faviconIcon, manifestIcons } from "@/components/seo/app-icons";
import { siteConfig } from "@/config/site.config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    lang: siteConfig.locale.htmlLang,
    dir: "ltr",
    categories: ["health", "medical"],
    background_color: siteConfig.theme.colors.background,
    theme_color: siteConfig.theme.themeColor,
    icons: [
      { src: appIconUrl(faviconIcon), type: faviconIcon.contentType, sizes: "any", purpose: "any" },
      ...manifestIcons.flatMap((icon) =>
        // The PNGs keep the mark inside the maskable safe zone, so each one is listed for both purposes.
        (["any", "maskable"] as const).map((purpose) => ({
          src: appIconUrl(icon),
          type: icon.contentType,
          sizes: `${icon.size}x${icon.size}`,
          purpose,
        })),
      ),
    ],
  };
}
