import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, generateNonce } from "./csp";

const NONCE = "dGVzdC1ub25jZS12YWx1ZQ==";

/** Parses a policy string into directive → sources (a bare directive maps to []). */
function parsePolicy(policy: string): Map<string, string[]> {
  return new Map(
    policy.split(";").map((part) => {
      const [directive, ...sources] = part.trim().split(/\s+/);
      return [directive!, sources];
    }),
  );
}

const production = parsePolicy(buildContentSecurityPolicy({ nonce: NONCE, isDev: false }));
const development = parsePolicy(buildContentSecurityPolicy({ nonce: NONCE, isDev: true }));

describe("buildContentSecurityPolicy", () => {
  it("allows scripts only via the per-request nonce and 'strict-dynamic'", () => {
    const scriptSrc = production.get("script-src");
    expect(scriptSrc).toContain(`'nonce-${NONCE}'`);
    expect(scriptSrc).toContain("'strict-dynamic'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
    expect(scriptSrc?.some((source) => source === "*" || source.startsWith("http"))).toBe(false);
  });

  it("requires the nonce for <style> elements in production", () => {
    expect(production.get("style-src")).toContain(`'nonce-${NONCE}'`);
    expect(production.get("style-src-elem")).toContain(`'nonce-${NONCE}'`);
    expect(production.get("style-src")).not.toContain("'unsafe-inline'");
    expect(production.get("style-src-elem")).not.toContain("'unsafe-inline'");
  });

  it("allows 'unsafe-eval' only in development, where React's error overlay needs it", () => {
    expect(development.get("script-src")).toContain("'unsafe-eval'");
    expect(production.get("script-src")).not.toContain("'unsafe-eval'");
  });

  it("never allows inline scripts, even in development", () => {
    expect(development.get("script-src")).not.toContain("'unsafe-inline'");
  });

  it("forbids framing, plugins and base-tag hijacking", () => {
    expect(production.get("frame-ancestors")).toEqual(["'none'"]);
    expect(production.get("object-src")).toEqual(["'none'"]);
    expect(production.get("frame-src")).toEqual(["'none'"]);
    expect(production.get("base-uri")).toEqual(["'self'"]);
    expect(production.get("form-action")).toEqual(["'self'"]);
  });

  it("keeps connections, fonts and images first-party", () => {
    expect(production.get("default-src")).toEqual(["'self'"]);
    expect(production.get("connect-src")).toEqual(["'self'"]);
    expect(production.get("font-src")).toEqual(["'self'"]);
    expect(production.get("img-src")).toEqual(["'self'", "data:", "blob:"]);
  });

  it("upgrades insecure requests in production only", () => {
    expect(production.has("upgrade-insecure-requests")).toBe(true);
    expect(development.has("upgrade-insecure-requests")).toBe(false);
  });

  it("allows the dev server's websocket only in development", () => {
    expect(development.get("connect-src")).toContain("ws:");
    expect(production.get("connect-src")).not.toContain("ws:");
  });
});

describe("generateNonce", () => {
  it("returns base64 encoding 128 bits of randomness", () => {
    const nonce = generateNonce();
    expect(nonce).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
    expect(Buffer.from(nonce, "base64")).toHaveLength(16);
  });

  it("returns a different value on every call", () => {
    const nonces = new Set(Array.from({ length: 1000 }, () => generateNonce()));
    expect(nonces.size).toBe(1000);
  });
});
