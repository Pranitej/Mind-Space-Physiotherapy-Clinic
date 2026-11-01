import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site.config";
import {
  buildDashboardHref,
  describeResults,
  getClinicTimeZoneName,
  getPageRange,
  getStatusLabel,
  getTimeSlotLabel,
  hasActiveFilters,
  isEnquiryStatus,
  truncateText,
} from "./display";

describe("status helpers", () => {
  it("recognises exactly the configured statuses", () => {
    for (const status of siteConfig.admin.statuses) {
      expect(isEnquiryStatus(status.id)).toBe(true);
      expect(getStatusLabel(status.id)).toBe(status.label);
    }
    expect(isEnquiryStatus("archived")).toBe(false);
    expect(isEnquiryStatus("")).toBe(false);
  });
});

describe("getTimeSlotLabel", () => {
  it("returns the configured label, or null for no preference", () => {
    const [slot] = siteConfig.booking.timeSlots;
    expect(getTimeSlotLabel(slot.id)).toBe(slot.label);
    expect(getTimeSlotLabel(null)).toBeNull();
  });
});

describe("truncateText", () => {
  it("leaves short text unchanged (apart from surrounding whitespace)", () => {
    expect(truncateText("  Knee pain after running  ", 40)).toBe("Knee pain after running");
  });

  it("cuts long text at a word boundary and adds an ellipsis", () => {
    expect(truncateText("My lower back hurts after long days at the desk", 20)).toBe("My lower back hurts…");
  });

  it("cuts mid-word when the only word boundary is too early", () => {
    expect(truncateText("Hi supercalifragilisticexpialidocious", 12)).toBe("Hi supercali…");
  });

  it("never splits an emoji", () => {
    const result = truncateText("😀😀😀😀😀😀", 3);
    expect(result).toBe("😀😀😀…");
    expect(result).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/);
  });
});

describe("buildDashboardHref", () => {
  it("omits defaults so links stay canonical", () => {
    expect(buildDashboardHref()).toBe("/admin");
    expect(buildDashboardHref({ page: 1 })).toBe("/admin");
  });

  it("includes the status and any page after the first", () => {
    expect(buildDashboardHref({ status: "new" })).toBe("/admin?status=new");
    expect(buildDashboardHref({ page: 3 })).toBe("/admin?page=3");
    expect(buildDashboardHref({ status: "booked", page: 2 })).toBe("/admin?status=booked&page=2");
  });

  it("keeps search, filters and a non-default sort, and encodes the search", () => {
    expect(
      buildDashboardHref({ q: "Priya S", service: "sports-injury", period: "7d", sort: "name-asc", page: 2 }),
    ).toBe("/admin?q=Priya+S&service=sports-injury&period=7d&sort=name-asc&page=2");
    expect(buildDashboardHref({ sort: "newest" })).toBe("/admin");
  });
});

describe("hasActiveFilters", () => {
  it("counts narrowing filters but not sorting or paging", () => {
    expect(hasActiveFilters({})).toBe(false);
    expect(hasActiveFilters({ sort: "oldest", page: 4 })).toBe(false);
    expect(hasActiveFilters({ q: "priya" })).toBe(true);
    expect(hasActiveFilters({ period: "today" })).toBe(true);
  });
});

describe("getPageRange and describeResults", () => {
  it("describes a middle page", () => {
    const range = getPageRange({ page: 2, pageSize: 20, total: 57 });
    expect(range).toEqual({ from: 21, to: 40 });
    expect(describeResults({ ...range, total: 57 })).toBe("Showing 21–40 of 57 enquiries");
  });

  it("clamps the last page to the total", () => {
    expect(getPageRange({ page: 3, pageSize: 20, total: 57 })).toEqual({ from: 41, to: 57 });
  });

  it("uses the status label and singular noun", () => {
    const range = getPageRange({ page: 1, pageSize: 20, total: 1 });
    expect(describeResults({ ...range, total: 1, statusLabel: "New" })).toBe("Showing 1 of 1 new enquiry");
  });

  it("describes an empty result", () => {
    expect(getPageRange({ page: 1, pageSize: 20, total: 0 })).toEqual({ from: 0, to: 0 });
    expect(describeResults({ from: 0, to: 0, total: 0, statusLabel: "Booked" })).toBe("No booked enquiries");
  });
});

describe("getClinicTimeZoneName", () => {
  it("names the configured time zone", () => {
    expect(getClinicTimeZoneName(new Date("2026-11-01T00:00:00Z"))).toBe("India Standard Time");
  });
});
