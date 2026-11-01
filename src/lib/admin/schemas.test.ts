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

  it("accepts a search, service, period and sort", () => {
    expect(
      enquiryListQuerySchema.parse({
        q: "  Priya ",
        service: "sports-injury",
        period: "30d",
        sort: "name-asc",
      }),
    ).toEqual({ page: 1, q: "Priya", service: "sports-injury", period: "30d", sort: "name-asc" });
  });

  it("treats a blank search as no search", () => {
    expect(enquiryListQuerySchema.parse({ q: "   " })).toEqual({ page: 1, q: undefined });
  });

  it.each([
    { q: "x".repeat(101) },
    { service: "massage" },
    { period: "1y" },
    { sort: "random" },
    { sort: { $natural: 1 } },
  ])("rejects %j", (query) => {
    expect(enquiryListQuerySchema.safeParse(query).success).toBe(false);
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
      sort: "newest",
    });
  });

  it("reads a search, service, period and sort", () => {
    expect(
      parseDashboardSearchParams({
        q: " 98765 ",
        service: "back-neck-pain",
        period: "today",
        sort: "oldest",
      }),
    ).toEqual({ page: 1, q: "98765", service: "back-neck-pain", period: "today", sort: "oldest" });
  });

  it("falls back to defaults instead of throwing", () => {
    expect(parseDashboardSearchParams({})).toEqual({ page: 1, sort: "newest" });
    expect(
      parseDashboardSearchParams({
        page: "zero",
        status: "nope",
        service: "x",
        period: "forever",
        sort: "?",
      }),
    ).toEqual({ page: 1, status: undefined, service: undefined, period: undefined, sort: "newest" });
  });

  it("drops a search that is too long rather than erroring", () => {
    expect(parseDashboardSearchParams({ q: "x".repeat(101) }).q).toBeUndefined();
  });

  it("falls back per field, keeping whichever value is valid", () => {
    expect(parseDashboardSearchParams({ page: "-4", status: "new" })).toEqual({
      page: 1,
      status: "new",
      sort: "newest",
    });
    expect(parseDashboardSearchParams({ page: "5", status: "nope", sort: "name-desc" })).toEqual({
      page: 5,
      status: undefined,
      sort: "name-desc",
    });
  });

  it("ignores repeated parameters (arrays)", () => {
    expect(
      parseDashboardSearchParams({ page: ["2", "3"], status: ["new", "booked"], q: ["a", "b"] }),
    ).toEqual({ page: 1, status: undefined, q: undefined, sort: "newest" });
  });
});
