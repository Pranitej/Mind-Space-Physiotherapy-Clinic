import { base64url, SignJWT } from "jose";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSessionToken, SESSION_AUDIENCE, SESSION_ISSUER, verifySessionToken } from "./session-token";

const SECRET = "test-session-secret-with-at-least-32-characters";
const MAX_AGE_SECONDS = 8 * 60 * 60;
const key = new TextEncoder().encode(SECRET);

afterEach(() => {
  vi.useRealTimers();
});

interface Claims {
  sub?: string;
  iss?: string;
  aud?: string;
  /** Seconds from now; `null` for a token without `exp`. */
  expiresIn?: number | null;
}

/** Signs a token like createSessionToken does, with any claim overridable. */
function signToken(
  { sub = "admin", iss = SESSION_ISSUER, aud = SESSION_AUDIENCE, expiresIn = 3600 }: Claims = {},
  alg = "HS256",
) {
  const jwt = new SignJWT({}).setProtectedHeader({ alg }).setSubject(sub).setIssuer(iss).setAudience(aud);
  jwt.setIssuedAt();
  if (expiresIn !== null) jwt.setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn);
  return jwt.sign(key);
}

function decodeSegment(segment: string): Record<string, unknown> {
  return JSON.parse(new TextDecoder().decode(base64url.decode(segment))) as Record<string, unknown>;
}

function encodeSegment(value: Record<string, unknown>): string {
  return base64url.encode(JSON.stringify(value));
}

describe("session tokens", () => {
  it("verifies a token it issued and reports when it expires", async () => {
    const before = Date.now();
    const token = await createSessionToken(SECRET, MAX_AGE_SECONDS);
    const session = await verifySessionToken(token, SECRET);

    expect(session).not.toBeNull();
    expect(session!.sub).toBe("admin");
    const expiresAt = session!.expiresAt.getTime();
    expect(expiresAt).toBeGreaterThanOrEqual(Math.floor(before / 1000) * 1000 + MAX_AGE_SECONDS * 1000);
    expect(expiresAt).toBeLessThanOrEqual(Date.now() + MAX_AGE_SECONDS * 1000);
  });

  it("signs with HS256 and carries the expected claims", async () => {
    const token = await createSessionToken(SECRET, MAX_AGE_SECONDS);
    const [header, payload] = token.split(".");

    expect(decodeSegment(header!)).toMatchObject({ alg: "HS256", typ: "JWT" });
    expect(decodeSegment(payload!)).toMatchObject({
      sub: "admin",
      iss: SESSION_ISSUER,
      aud: SESSION_AUDIENCE,
    });
  });

  it("returns null when the token or the secret is missing", async () => {
    const token = await createSessionToken(SECRET, MAX_AGE_SECONDS);
    expect(await verifySessionToken(undefined, SECRET)).toBeNull();
    expect(await verifySessionToken("", SECRET)).toBeNull();
    expect(await verifySessionToken(token, undefined)).toBeNull();
    expect(await verifySessionToken(token, "")).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken("another-secret-that-is-also-32-characters-long", MAX_AGE_SECONDS);
    expect(await verifySessionToken(token, SECRET)).toBeNull();
  });

  it("rejects a token once it has expired", async () => {
    const token = await createSessionToken(SECRET, 60);
    expect(await verifySessionToken(token, SECRET)).not.toBeNull();

    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(Date.now() + 61_000);
    expect(await verifySessionToken(token, SECRET)).toBeNull();
  });

  it("rejects a token without an expiry", async () => {
    expect(await verifySessionToken(await signToken({ expiresIn: null }), SECRET)).toBeNull();
  });

  it('rejects an unsigned token (alg "none")', async () => {
    const now = Math.floor(Date.now() / 1000);
    const header = encodeSegment({ alg: "none", typ: "JWT" });
    const payload = encodeSegment({
      sub: "admin",
      iss: SESSION_ISSUER,
      aud: SESSION_AUDIENCE,
      iat: now,
      exp: now + 3600,
    });

    expect(await verifySessionToken(`${header}.${payload}.`, SECRET)).toBeNull();
  });

  it("rejects a token signed with another algorithm, even with the right key", async () => {
    expect(await verifySessionToken(await signToken({}, "HS512"), SECRET)).toBeNull();
  });

  it("rejects a token whose payload was modified after signing", async () => {
    const token = await createSessionToken(SECRET, 60);
    const [header, payload, signature] = token.split(".");
    const extended = encodeSegment({
      ...decodeSegment(payload!),
      exp: Math.floor(Date.now() / 1000) + 365 * 86_400,
    });

    expect(await verifySessionToken(`${header}.${extended}.${signature}`, SECRET)).toBeNull();
  });

  it("rejects a token whose signature was modified", async () => {
    const token = await createSessionToken(SECRET, MAX_AGE_SECONDS);
    const [header, payload, signature] = token.split(".");
    const index = Math.floor(signature!.length / 2);
    const forged =
      signature!.slice(0, index) + (signature![index] === "A" ? "B" : "A") + signature!.slice(index + 1);

    expect(await verifySessionToken(`${header}.${payload}.${forged}`, SECRET)).toBeNull();
  });

  it.each<[string, Claims]>([
    ["issuer", { iss: "someone-else" }],
    ["audience", { aud: "another-app" }],
    ["subject", { sub: "patient" }],
  ])("rejects a correctly signed token with the wrong %s", async (_claim, claims) => {
    expect(await verifySessionToken(await signToken(), SECRET)).not.toBeNull();
    expect(await verifySessionToken(await signToken(claims), SECRET)).toBeNull();
  });

  it.each(["not-a-token", "a.b.c", "a.b", "....."])(
    "returns null for garbage input (%j)",
    async (garbage) => {
      expect(await verifySessionToken(garbage, SECRET)).toBeNull();
    },
  );
});
