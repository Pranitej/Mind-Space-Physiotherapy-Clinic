import { afterEach, describe, expect, it, vi } from "vitest";
import {
  adminApi,
  describeLoginFailure,
  describeStatusUpdateFailure,
  formatRetryAfter,
  NETWORK_ERROR_STATUS,
  type ApiFailure,
} from "./api-client";

function mockFetch(response: Response | Error) {
  const fetchMock = vi.fn<typeof fetch>(() =>
    response instanceof Error ? Promise.reject(response) : Promise.resolve(response),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("adminApi requests", () => {
  it("signs in with a JSON POST and treats 204 as success", async () => {
    const fetchMock = mockFetch(new Response(null, { status: 204 }));

    await expect(adminApi.signIn("s3cret")).resolves.toEqual({ ok: true, status: 204, data: undefined });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/admin/session");
    expect(init).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "s3cret" }),
      credentials: "same-origin",
    });
  });

  it("signs out with a body-less DELETE", async () => {
    const fetchMock = mockFetch(new Response(null, { status: 204 }));
    await adminApi.signOut();
    const [, init] = fetchMock.mock.calls[0]!;
    expect(init).toMatchObject({ method: "DELETE", headers: undefined, body: undefined });
  });

  it("unwraps the data envelope on success", async () => {
    const dto = { id: "a".repeat(24), status: "booked" };
    const fetchMock = mockFetch(jsonResponse({ data: dto }, 200));

    await expect(adminApi.updateEnquiryStatus("a".repeat(24), "booked")).resolves.toEqual({
      ok: true,
      status: 200,
      data: dto,
    });
    expect(fetchMock.mock.calls[0]![0]).toBe(`/api/admin/enquiries/${"a".repeat(24)}`);
  });

  it("encodes the id so it cannot change the request path", async () => {
    const fetchMock = mockFetch(jsonResponse({ data: null }, 200));
    await adminApi.updateEnquiryStatus("../session", "new");
    expect(fetchMock.mock.calls[0]![0]).toBe("/api/admin/enquiries/..%2Fsession");
  });

  it("returns the error envelope on failure", async () => {
    mockFetch(jsonResponse({ error: { code: "UNAUTHORIZED", message: "Incorrect password." } }, 401));
    await expect(adminApi.signIn("wrong")).resolves.toEqual({
      ok: false,
      status: 401,
      error: { code: "UNAUTHORIZED", message: "Incorrect password." },
    });
  });

  it("tolerates a non-JSON error body (e.g. a platform error page)", async () => {
    mockFetch(new Response("<html>Bad gateway</html>", { status: 502 }));
    await expect(adminApi.signIn("pw")).resolves.toEqual({ ok: false, status: 502, error: null });
  });

  it("reports a network failure instead of throwing", async () => {
    mockFetch(new TypeError("Failed to fetch"));
    await expect(adminApi.signOut()).resolves.toEqual({
      ok: false,
      status: NETWORK_ERROR_STATUS,
      error: null,
    });
  });
});

function failure(status: number, error: ApiFailure["error"] = null): ApiFailure {
  return { ok: false, status, error };
}

describe("formatRetryAfter", () => {
  it("rounds up to whole minutes", () => {
    expect(formatRetryAfter(1)).toBe("1 minute");
    expect(formatRetryAfter(60)).toBe("1 minute");
    expect(formatRetryAfter(61)).toBe("2 minutes");
    expect(formatRetryAfter(900)).toBe("15 minutes");
  });
});

describe("describeLoginFailure", () => {
  it("explains a wrong password", () => {
    expect(describeLoginFailure(failure(401))).toBe("Incorrect password.");
  });

  it("says how long to wait when rate limited", () => {
    const error = { code: "RATE_LIMITED" as const, message: "Too many requests.", retryAfterSeconds: 600 };
    expect(describeLoginFailure(failure(429, error))).toBe("Too many attempts. Try again in 10 minutes.");
  });

  it("still explains a rate limit without a usable retry time", () => {
    const error = { code: "RATE_LIMITED" as const, message: "Too many requests.", retryAfterSeconds: "soon" };
    expect(describeLoginFailure(failure(429, error))).toBe("Too many attempts. Try again later.");
  });

  it("shows the server's field message for a validation error", () => {
    const error = {
      code: "VALIDATION_ERROR" as const,
      message: "Please check the highlighted fields.",
      fields: { password: "Password is too long." },
    };
    expect(describeLoginFailure(failure(400, error))).toBe("Password is too long.");
  });

  it("distinguishes network problems from server errors", () => {
    expect(describeLoginFailure(failure(NETWORK_ERROR_STATUS))).toMatch(/connection/);
    expect(describeLoginFailure(failure(500))).toBe("Something went wrong. Please try again.");
  });
});

describe("describeStatusUpdateFailure", () => {
  it.each([
    [NETWORK_ERROR_STATUS, /connection/],
    [404, /no longer exists/],
    [429, /too many changes/],
    [500, /^Not saved\. Please try again\.$/],
  ])("describes status %i", (status, expected) => {
    expect(describeStatusUpdateFailure(failure(status))).toMatch(expected);
  });
});
