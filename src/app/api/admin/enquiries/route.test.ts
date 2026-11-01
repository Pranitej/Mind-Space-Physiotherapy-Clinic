import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminSessionForApi } from "@/lib/auth/dal";
import { listEnquiries } from "@/lib/enquiries/enquiry.repository";
import type { EnquiryPage } from "@/lib/enquiries/enquiry.types";
import { GET } from "./route";

vi.mock("@/lib/auth/dal", () => ({ getAdminSessionForApi: vi.fn() }));
vi.mock("@/lib/enquiries/enquiry.repository", () => ({ listEnquiries: vi.fn() }));
vi.mock("@/lib/logger", () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const emptyPage: EnquiryPage = { items: [], total: 0, page: 1, pageSize: 20, pageCount: 1 };

const list = (query = "") => GET(new NextRequest(`http://localhost:3000/api/admin/enquiries${query}`));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAdminSessionForApi).mockResolvedValue({
    sub: "admin",
    expiresAt: new Date(Date.now() + 60_000),
  });
  vi.mocked(listEnquiries).mockResolvedValue(emptyPage);
});

describe("GET /api/admin/enquiries", () => {
  it("responds 401 without a valid session and never queries", async () => {
    vi.mocked(getAdminSessionForApi).mockResolvedValueOnce(null);

    const response = await list();

    expect(response.status).toBe(401);
    expect(listEnquiries).not.toHaveBeenCalled();
  });

  it("lists the first page of all enquiries by default", async () => {
    const response = await list();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: emptyPage });
    expect(listEnquiries).toHaveBeenCalledWith({ page: 1 });
  });

  it("passes a validated page and status through", async () => {
    await list("?page=3&status=booked");
    expect(listEnquiries).toHaveBeenCalledWith({ page: 3, status: "booked" });
  });

  it("uses the first value of a repeated parameter", async () => {
    await list("?status=new&status=closed");
    expect(listEnquiries).toHaveBeenCalledWith({ page: 1, status: "new" });
  });

  it.each(["?page=0", "?page=two", "?status=archived", "?status=%24ne"])(
    "rejects %s with 400",
    async (query) => {
      const response = await list(query);

      expect(response.status).toBe(400);
      expect((await response.json()).error.code).toBe("VALIDATION_ERROR");
      expect(listEnquiries).not.toHaveBeenCalled();
    },
  );
});
