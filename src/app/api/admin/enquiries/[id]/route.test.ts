import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { siteConfig } from "@/config/site.config";
import { getAdminSessionForApi } from "@/lib/auth/dal";
import { updateEnquiryStatus } from "@/lib/enquiries/enquiry.repository";
import type { EnquiryDto } from "@/lib/enquiries/enquiry.types";
import { logger } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { PATCH } from "./route";

vi.mock("@/lib/env", () => ({
  isProduction: false,
  getServerEnv: () => ({ SESSION_SECRET: "test-session-secret-that-is-long-enough" }),
}));
vi.mock("@/lib/auth/dal", () => ({ getAdminSessionForApi: vi.fn() }));
vi.mock("@/lib/security/rate-limit", () => ({ enforceRateLimit: vi.fn() }));
vi.mock("@/lib/logger", () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
// Keep the real id validation; replace only the database write.
vi.mock("@/lib/enquiries/enquiry.repository", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/enquiries/enquiry.repository")>()),
  updateEnquiryStatus: vi.fn(),
}));

const ORIGIN = "http://localhost:3000";
const ID = "65f1c0ffee0123456789abcd";

const enquiry: EnquiryDto = {
  id: ID,
  reference: "MS-261101-7K3QX",
  name: "Ravi Kumar",
  email: "ravi@example.com",
  phone: "+919876543210",
  service: "back-neck-pain",
  preferredDate: "2026-11-05",
  preferredTime: "morning",
  message: "Lower back pain for two weeks.",
  status: "contacted",
  notifications: { patient: "sent", clinic: "sent" },
  createdAt: "2026-11-01T04:30:00.000Z",
  updatedAt: "2026-11-01T06:00:00.000Z",
};

function patch(id: string, body: unknown, headers: Record<string, string> = {}) {
  const request = new NextRequest(`${ORIGIN}/api/admin/enquiries/${id}`, {
    method: "PATCH",
    headers: {
      "x-forwarded-host": "localhost:3000",
      "x-forwarded-for": "203.0.113.7",
      origin: ORIGIN,
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
  return PATCH(request, { params: Promise.resolve({ id }) });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(enforceRateLimit).mockResolvedValue(undefined);
  vi.mocked(getAdminSessionForApi).mockResolvedValue({
    sub: "admin",
    expiresAt: new Date(Date.now() + 60_000),
  });
  vi.mocked(updateEnquiryStatus).mockResolvedValue(enquiry);
});

describe("PATCH /api/admin/enquiries/[id]", () => {
  it("updates the status and returns the enquiry", async () => {
    const response = await patch(ID, { status: "contacted" });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: enquiry });
    expect(updateEnquiryStatus).toHaveBeenCalledWith(ID, "contacted");
    expect(enforceRateLimit).toHaveBeenCalledWith(
      "admin-mutation",
      expect.stringMatching(/^[a-f0-9]{32}$/),
      siteConfig.security.rateLimits.adminMutation,
    );
  });

  it("logs the reference and status only, never personal data", async () => {
    await patch(ID, { status: "contacted" });

    expect(logger.info).toHaveBeenCalledWith("admin.enquiry_status_updated", {
      reference: enquiry.reference,
      status: "contacted",
    });
    const output = JSON.stringify(vi.mocked(logger.info).mock.calls);
    for (const personal of [enquiry.name, enquiry.email, enquiry.phone, enquiry.message!]) {
      expect(output).not.toContain(personal);
    }
  });

  it("responds 401 without a valid session, before any rate limit or write", async () => {
    vi.mocked(getAdminSessionForApi).mockResolvedValueOnce(null);

    const response = await patch(ID, { status: "booked" });

    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe("UNAUTHORIZED");
    expect(enforceRateLimit).not.toHaveBeenCalled();
    expect(updateEnquiryStatus).not.toHaveBeenCalled();
  });

  it("blocks cross-origin requests even with a session cookie", async () => {
    const response = await patch(ID, { status: "booked" }, { origin: "https://evil.example" });

    expect(response.status).toBe(403);
    expect(updateEnquiryStatus).not.toHaveBeenCalled();
  });

  it.each([{ status: "archived" }, { status: "" }, {}, { status: { $ne: null } }])(
    "rejects an invalid body %j with field errors",
    async (body) => {
      const response = await patch(ID, body);

      expect(response.status).toBe(400);
      expect((await response.json()).error).toMatchObject({
        code: "VALIDATION_ERROR",
        fields: { status: expect.any(String) },
      });
      expect(updateEnquiryStatus).not.toHaveBeenCalled();
    },
  );

  it.each(["not-an-id", "65f1c0ffee0123456789abc", "zzzzzzzzzzzzzzzzzzzzzzzz"])(
    "responds 404 for a malformed id (%s) without querying",
    async (id) => {
      const response = await patch(id, { status: "booked" });

      expect(response.status).toBe(404);
      expect(updateEnquiryStatus).not.toHaveBeenCalled();
    },
  );

  it("responds 404 when no enquiry has that id", async () => {
    vi.mocked(updateEnquiryStatus).mockResolvedValueOnce(null);

    const response = await patch(ID, { status: "booked" });

    expect(response.status).toBe(404);
    expect((await response.json()).error).toEqual({ code: "NOT_FOUND", message: "Enquiry not found." });
  });
});
