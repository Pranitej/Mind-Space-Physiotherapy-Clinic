import { faviconIcon, manifestIcons, type AppIconVariant } from "@/components/seo/app-icons";
import { brandMarkImageResponse } from "@/components/seo/brand-mark-image";

const variants: AppIconVariant[] = [faviconIcon, ...manifestIcons];

/**
 * App icons generated from the clinic emblem and theme colours (replacing
 * hand-maintained favicon files): the favicon plus the PNG sizes the web
 * manifest needs. Each variant is prerendered at build time.
 */
export function generateImageMetadata() {
  return variants.map(({ id, contentType, size }) => ({
    id,
    contentType,
    size: { width: size, height: size },
  }));
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const variantId = await id;
  const icon = variants.find((variant) => variant.id === variantId);
  if (!icon) return new Response("Not found", { status: 404 });
  return brandMarkImageResponse(icon.size, icon.mark);
}
