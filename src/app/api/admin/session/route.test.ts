import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { siteConfig } from "@/config/site.config";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import { HttpError } from "@/lib/http/errors";
import { logger } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { DELETE, POST } from "./route";

// The real request guards (origin check, body parsing, IP hashing) run; only
// crypto-heavy, cookie and database dependencies are replaced.
vi.mock("@/lib/env", () => ({
  isProduction: false,
  getServerEnv: () => ({
    SESSION_SECRET: "test-session-secret-that-is-long-enough",
    ADMIN_PASSWORD_HASH: "scrypt:32768:8:1:c2FsdA:aGFzaA",
  }),
}));
vi.mock("@/lib/auth/password", () => ({ verifyPassword: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ createSession: vi.fn(), deleteSession: vi.fn() }));
vi.mock("@/lib/security/rate-limit", () => ({ enforceRateLimit: vi.fn() }));
vi.mock("@/lib/logger", () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const ORIGIN = "http://localhost:3000";
const PASSWORD = "the-real-admin-password";

function sessionRequest(
  method: "POST" | "DELETE",
  { body, headers = {} }: { body?: string; headers?: Record<string, string> } = {},
) {
  return new NextRequest(`${ORIGIN}/api/admin/session`, {
    method,
    headers: {
      "x-forwarded-host": "localhost:3000",
      "x-forwarded-for": "203.0.113.7",
      origin: ORIGIN,
      ...(body === undefined ? {} : { "content-type": "application/json" }),
      ...headers,
    },
    body,
  });
}

const login = (password: unknown, headers?: Record<string, string>) =>
  POST(sessionRequest("POST", { body: JSON.stringify({ password }), headers }));

function allLogOutput() {
  return JSON.stringify(Object.values(vi.mocked(logger)).map((fn) => vi.mocked(fn).mock.calls));
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(enforceRateLimit).mockResolvedValue(undefined);
  vi.mocked(verifyPassword).mockImplementation(async (password) => password === PASSWORD);
});

describe("POST /api/admin/session (sign in)", () => {
  it("creates a session and responds 204 for the correct password", async () => {
    const response = await login(PASSWORD);

    expect(response.status).toBe(204);
    expect(createSession).toHaveBeenCalledOnce();
    expect(logger.info).toHaveBeenCalledWith("admin.login_succeeded", expect.any(Object));
  });

  it("consumes the per-IP login rate limit before checking the password", async () => {
    await login(PASSWORD);

    const [scope, identifier, rule] = vi.mocked(enforceRateLimit).mock.calls[0]!;
    expect(scope).toBe("admin-login");
    expect(rule).toBe(siteConfig.security.rateLimits.adminLogin);
    // Keyed hash, never the raw IP.
    expect(identifier).toMatch(/^[a-f0-9]{32}$/);
    expect(identifier).not.toContain("203.0.113.7");
    expect(vi.mocked(enforceRateLimit).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(verifyPassword).mock.invocationCallOrder[0]!,
    );
  });

  it("rejects a wrong password with a generic 401 and no session", async () => {
    const response = await login("guess-1");

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: { code: "UNAUTHORIZED", message: "Incorrect password." },
    });
    expect(createSession).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith("admin.login_failed", expect.any(Object));
  });

  it("never logs the submitted password or the client IP", async () => {
    await login("guess-1");
    await login(PASSWORD);

    const output = allLogOutput();
    expect(output).not.toContain("guess-1");
    expect(output).not.toContain(PASSWORD);
    expect(output).not.toContain("203.0.113.7");
  });

  it("responds 429 with Retry-After when the IP is rate limited, without checking the password", async () => {
    vi.mocked(enforceRateLimit).mockRejectedValueOnce(
      new HttpError(
        429,
        "RATE_LIMITED",
        "Too many requests.",
        { retryAfterSeconds: 540 },
        { "Retry-After": "540" },
      ),
    );

    const response = await login(PASSWORD);

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("540");
    expect((await response.json()).error).toMatchObject({ code: "RATE_LIMITED", retryAfterSeconds: 540 });
    expect(verifyPassword).not.toHaveBeenCalled();
    expect(createSession).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith("admin.login_rate_limited", expect.any(Object));
  });

  it("blocks cross-origin requests before doing any work", async () => {
    const response = await login(PASSWORD, { origin: "https://evil.example" });

    expect(response.status).toBe(403);
    expect(enforceRateLimit).not.toHaveBeenCalled();
    expect(verifyPassword).not.toHaveBeenCalled();
  });

  it.each([
    ["an empty password", JSON.stringify({ password: "" }), 400],
    ["a non-string password", JSON.stringify({ password: { $ne: "" } }), 400],
    ["malformed JSON", "{password:", 400],
  ])("rejects %s", async (_case, body, status) => {
    const response = await POST(sessionRequest("POST", { body }));
    expect(response.status).toBe(status);
    expect(verifyPassword).not.toHaveBeenCalled();
  });

  it("rejects a non-JSON content type (e.g. a cross-site HTML form post)", async () => {
    const response = await POST(
      sessionRequest("POST", {
        body: `password=${PASSWORD}`,
        headers: { "content-type": "application/x-www-form-urlencoded" },
      }),
    );
    expect(response.status).toBe(415);
    expect(verifyPassword).not.toHaveBeenCalled();
  });

  it("hides unexpected failures behind a generic 500", async () => {
    vi.mocked(verifyPassword).mockRejectedValueOnce(new Error("scrypt exploded"));

    const response = await login(PASSWORD);

    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("scrypt exploded");
    expect(logger.error).toHaveBeenCalledWith("admin.login_error", expect.any(Object));
  });
});

describe("DELETE /api/admin/session (sign out)", () => {
  it("deletes the session and responds 204", async () => {
    const response = await DELETE(sessionRequest("DELETE"));

    expect(response.status).toBe(204);
    expect(deleteSession).toHaveBeenCalledOnce();
  });

  it("blocks cross-origin requests", async () => {
    const response = await DELETE(sessionRequest("DELETE", { headers: { origin: "https://evil.example" } }));

    expect(response.status).toBe(403);
    expect(deleteSession).not.toHaveBeenCalled();
  });
});
