import { faviconIcon, manifestIcons, type AppIconVariant } from "@/components/seo/app-icons";
import { renderBrandMarkSvg } from "@/components/seo/brand-mark";
import { brandMarkImageResponse } from "@/components/seo/brand-mark-image";

/**
 * App icons generated from the shared brand mark and theme colours (replacing
 * a hand-maintained favicon file): an SVG favicon plus the PNG sizes the web
 * manifest needs. Each variant is prerendered at build time.
 */
export function generateImageMetadata() {
  const variants: AppIconVariant[] = [faviconIcon, ...manifestIcons];
  return variants.map(({ id, contentType, size }) => ({
    id,
    contentType,
    ...(size ? { size: { width: size, height: size } } : {}),
  }));
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const variantId = await id;

  if (variantId === faviconIcon.id) {
    return new Response(renderBrandMarkSvg(faviconIcon.mark), {
      headers: {
        "Content-Type": faviconIcon.contentType,
        // An SVG opened directly is a document; make sure it can never run script.
        "Content-Security-Policy": "default-src 'none'",
      },
    });
  }

  const icon = manifestIcons.find((variant) => variant.id === variantId);
  if (!icon) return new Response("Not found", { status: 404 });
  return brandMarkImageResponse(icon.size, icon.mark);
}
