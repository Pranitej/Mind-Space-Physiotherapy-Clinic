import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { noIndexMetadata } from "@/lib/seo";

/**
 * Root of the admin area. Every admin route inherits `noindex` from here (on
 * top of the X-Robots-Tag and no-store headers set in next.config.ts).
 *
 * This layout does not check the session: the login page lives under it. The
 * check lives in the `(dashboard)` group, in each page, and in each API route.
 */
export const metadata: Metadata = {
  ...noIndexMetadata,
  title: { default: "Admin", template: `%s · Admin | ${siteConfig.name}` },
  // Private pages have no canonical public URL, and shouldn't advertise one.
  alternates: null,
  openGraph: null,
  twitter: null,
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="flex flex-1 flex-col">{children}</div>;
}
