import { siteConfig } from "@/config/site.config";

const HEX_COLOUR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/**
 * `siteConfig.theme.colors` as `--brand-*` CSS custom properties, the bridge
 * between the config file and the Tailwind tokens in globals.css.
 *
 * Values end up inside a <style> tag or style attribute, so anything other
 * than a plain hex colour is rejected at startup rather than injected.
 */
export function themeCssVariables(): Record<`--brand-${string}`, string> {
  return Object.fromEntries(
    Object.entries(siteConfig.theme.colors).map(([token, value]) => {
      if (!HEX_COLOUR.test(value)) throw new Error(`Invalid theme colour for "${token}": ${value}`);
      const name = token.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
      return [`--brand-${name}`, value];
    }),
  );
}

/** The same variables as a `:root { … }` rule for the root layout's <style> tag. */
export function themeCssRule(): string {
  const declarations = Object.entries(themeCssVariables()).map(([name, value]) => `${name}:${value}`);
  return `:root{${declarations.join(";")}}`;
}
