import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "@/lib/http/errors";
import { assertSameOrigin, getClientIp, hashIp, readJsonBody } from "./request";

const SITE = "https://clinic.example";
const ENDPOINT = `${SITE}/api/enquiries`;

function request(headers: Record<string, string>, body?: string) {
  return new NextRequest(ENDPOINT, { method: "POST", headers, body });
}

function captureError(fn: () => unknown): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error("Expected the function to throw.");
}

async function captureRejection(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error("Expected the promise to reject.");
}

function expectHttpError(error: unknown, status: number, code: string) {
  expect(error).toBeInstanceOf(HttpError);
  expect(error).toMatchObject({ status, code });
}

describe("assertSameOrigin", () => {
  it("accepts a request whose Origin matches the Host", () => {
    expect(() => assertSameOrigin(request({ origin: SITE, host: "clinic.example" }))).not.toThrow();
  });

  it("matches against X-Forwarded-Host when the platform proxy sets it", () => {
    const proxied = request({ origin: SITE, host: "internal:3000", "x-forwarded-host": "clinic.example" });
    expect(() => assertSameOrigin(proxied)).not.toThrow();
  });

  it.each([
    ["a foreign site", "https://evil.example"],
    ["a sibling subdomain", "https://admin.clinic.example"],
    ["a different port", "https://clinic.example:8443"],
    ["an opaque origin", "null"],
  ])("rejects an Origin from %s (403)", (_label, origin) => {
    expectHttpError(
      captureError(() => assertSameOrigin(request({ origin, host: "clinic.example" }))),
      403,
      "FORBIDDEN",
    );
  });

  it("rejects an Origin when the Host is unknown", () => {
    expectHttpError(
      captureError(() => assertSameOrigin(request({ origin: SITE }))),
      403,
      "FORBIDDEN",
    );
  });

  it("falls back to Sec-Fetch-Site: same-origin when Origin is absent", () => {
    const sameOrigin = request({ host: "clinic.example", "sec-fetch-site": "same-origin" });
    expect(() => assertSameOrigin(sameOrigin)).not.toThrow();
  });

  it.each(["cross-site", "same-site", "none"])(
    "rejects Sec-Fetch-Site: %s without an Origin (403)",
    (site) => {
      const crossSite = request({ host: "clinic.example", "sec-fetch-site": site });
      expectHttpError(
        captureError(() => assertSameOrigin(crossSite)),
        403,
        "FORBIDDEN",
      );
    },
  );

  it("rejects a request with neither Origin nor Sec-Fetch-Site (403)", () => {
    expectHttpError(
      captureError(() => assertSameOrigin(request({ host: "clinic.example" }))),
      403,
      "FORBIDDEN",
    );
  });
});

describe("readJsonBody", () => {
  const json = { "content-type": "application/json" };

  it("parses a valid JSON body", async () => {
    const body = { name: "Test", preferredDate: "2026-11-05" };
    expect(await readJsonBody(request(json, JSON.stringify(body)))).toEqual(body);
  });

  it.each(["application/json; charset=utf-8", "Application/JSON"])(
    "accepts content type %j",
    async (type) => {
      expect(await readJsonBody(request({ "content-type": type }, "[1,2,3]"))).toEqual([1, 2, 3]);
    },
  );

  // These are the types a cross-site HTML form can send without a CORS preflight.
  it.each(["text/plain", "application/x-www-form-urlencoded", "multipart/form-data; boundary=x"])(
    "rejects content type %j (415)",
    async (type) => {
      const error = await captureRejection(readJsonBody(request({ "content-type": type }, "{}")));
      expectHttpError(error, 415, "UNSUPPORTED_MEDIA_TYPE");
    },
  );

  it("rejects a request without a content type (415)", async () => {
    expectHttpError(await captureRejection(readJsonBody(request({}, "{}"))), 415, "UNSUPPORTED_MEDIA_TYPE");
  });

  it("rejects a declared Content-Length over the limit before reading the body (413)", async () => {
    const oversized = request({ ...json, "content-length": "1000000" }, "{}");
    expectHttpError(await captureRejection(readJsonBody(oversized, 1024)), 413, "PAYLOAD_TOO_LARGE");
  });

  it("rejects an oversized body even without a Content-Length header (413)", async () => {
    const body = JSON.stringify({ message: "x".repeat(2048) });
    expectHttpError(
      await captureRejection(readJsonBody(request(json, body), 1024)),
      413,
      "PAYLOAD_TOO_LARGE",
    );
  });

  it("measures the limit in bytes, not characters (413)", async () => {
    // 7 characters, but 12 bytes in UTF-8.
    const body = JSON.stringify("ééééé");
    expectHttpError(await captureRejection(readJsonBody(request(json, body), 10)), 413, "PAYLOAD_TOO_LARGE");
  });

  it.each(["{", "{'single': 'quotes'}", "undefined", ""])("rejects invalid JSON %j (400)", async (body) => {
    expectHttpError(await captureRejection(readJsonBody(request(json, body))), 400, "BAD_REQUEST");
  });
});

describe("getClientIp", () => {
  it("uses the first X-Forwarded-For entry (the client, as set by the platform edge)", () => {
    expect(getClientIp(request({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe("203.0.113.7");
  });

  it("falls back to X-Real-IP, then to 'unknown'", () => {
    expect(getClientIp(request({ "x-real-ip": " 198.51.100.4 " }))).toBe("198.51.100.4");
    expect(getClientIp(request({}))).toBe("unknown");
  });
});

describe("hashIp", () => {
  beforeEach(() => {
    vi.stubEnv("MONGODB_URI", "mongodb://localhost:27017/test");
    vi.stubEnv("ADMIN_PASSWORD_HASH", "scrypt:32768:8:1:c2FsdA:aGFzaA");
    vi.stubEnv("SESSION_SECRET", "s".repeat(48));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns a stable keyed hash that does not reveal the address", () => {
    const hash = hashIp("203.0.113.7");
    expect(hash).toMatch(/^[0-9a-f]{32}$/);
    expect(hashIp("203.0.113.7")).toBe(hash);
    expect(hashIp("203.0.113.8")).not.toBe(hash);
  });
});
