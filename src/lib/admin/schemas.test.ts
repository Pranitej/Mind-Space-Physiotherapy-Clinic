import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site.config";
import {
  adminLoginSchema,
  enquiryListQuerySchema,
  enquiryStatusUpdateSchema,
  MAX_PAGE,
  parseDashboardSearchParams,
} from "./schemas";

const statusIds = siteConfig.admin.statuses.map((status) => status.id);

describe("adminLoginSchema", () => {
  it("accepts a password", () => {
    expect(adminLoginSchema.parse({ password: "correct horse battery staple" })).toEqual({
      password: "correct horse battery staple",
    });
  });

  it.each([
    ["missing", {}],
    ["empty", { password: "" }],
    ["not a string", { password: 12345678 }],
    ["an operator object", { password: { $ne: "" } }],
    ["longer than 256 characters", { password: "a".repeat(257) }],
  ])("rejects a password that is %s", (_case, body) => {
    expect(adminLoginSchema.safeParse(body).success).toBe(false);
  });

  it("drops unknown fields", () => {
    expect(adminLoginSchema.parse({ password: "pw", isAdmin: true })).toEqual({ password: "pw" });
  });
});

describe("enquiryListQuerySchema", () => {
  it("defaults to the first page of all enquiries", () => {
    expect(enquiryListQuerySchema.parse({})).toEqual({ page: 1 });
  });

  it("coerces the page from a query string and accepts every configured status", () => {
    for (const status of statusIds) {
      expect(enquiryListQuerySchema.parse({ page: "3", status })).toEqual({ page: 3, status });
    }
  });

  it.each(["0", "-1", "1.5", "abc", "", String(MAX_PAGE + 1), "Infinity"])("rejects page=%j", (page) => {
    expect(enquiryListQuerySchema.safeParse({ page }).success).toBe(false);
  });

  it("rejects a status that is not in the config", () => {
    const result = enquiryListQuerySchema.safeParse({ status: "archived" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["status"]);
  });
});

describe("enquiryStatusUpdateSchema", () => {
  it("accepts a configured status", () => {
    expect(enquiryStatusUpdateSchema.parse({ status: "booked" })).toEqual({ status: "booked" });
  });

  it.each([{}, { status: "" }, { status: "BOOKED" }, { status: ["booked"] }, { status: { $set: "x" } }])(
    "rejects %j",
    (body) => {
      expect(enquiryStatusUpdateSchema.safeParse(body).success).toBe(false);
    },
  );
});

describe("parseDashboardSearchParams", () => {
  it("reads a valid page and status", () => {
    expect(parseDashboardSearchParams({ page: "2", status: "contacted" })).toEqual({
      page: 2,
      status: "contacted",
    });
  });

  it("falls back to defaults instead of throwing", () => {
    expect(parseDashboardSearchParams({})).toEqual({ page: 1, status: undefined });
    expect(parseDashboardSearchParams({ page: "zero", status: "nope" })).toEqual({
      page: 1,
      status: undefined,
    });
  });

  it("falls back per field, keeping whichever value is valid", () => {
    expect(parseDashboardSearchParams({ page: "-4", status: "new" })).toEqual({ page: 1, status: "new" });
    expect(parseDashboardSearchParams({ page: "5", status: "nope" })).toEqual({ page: 5, status: undefined });
  });

  it("ignores repeated parameters (arrays)", () => {
    expect(parseDashboardSearchParams({ page: ["2", "3"], status: ["new", "booked"] })).toEqual({
      page: 1,
      status: undefined,
    });
  });
});
