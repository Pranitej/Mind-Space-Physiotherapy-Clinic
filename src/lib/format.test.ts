import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site.config";
import {
  formatAddressLines,
  formatCalendarDate,
  formatDate,
  formatDateTime,
  formatIndianPhone,
  formatInr,
  formatTime,
  normalizeIndianMobile,
  todayInClinicTimeZone,
  whatsappUrl,
} from "./format";

describe("formatInr", () => {
  it.each([
    [0, "₹0"],
    [900, "₹900"],
    [1200, "₹1,200"],
    [150000, "₹1,50,000"],
    [1234567, "₹12,34,567"],
  ])("formats %d as %s (Indian digit grouping)", (amount, expected) => {
    expect(formatInr(amount)).toBe(expected);
  });

  it("rounds to whole rupees", () => {
    expect(formatInr(999.6)).toBe("₹1,000");
  });
});

describe("dates (DD/MM/YYYY, Asia/Kolkata)", () => {
  it("formats a calendar date without time-zone shifting", () => {
    expect(formatCalendarDate("2026-11-05")).toBe("05/11/2026");
  });

  it("formats instants in IST, not UTC", () => {
    // 19:00 UTC on 31 Oct is 00:30 IST on 1 Nov.
    const instant = new Date("2026-10-31T19:00:00Z");
    expect(formatDate(instant)).toBe("01/11/2026");
    expect(formatDate(instant.toISOString())).toBe("01/11/2026");
    expect(todayInClinicTimeZone(instant)).toBe("2026-11-01");
  });

  it("formats date and time with a 12-hour clock", () => {
    // ICU may separate the time and day period with a narrow no-break space.
    expect(formatDateTime(new Date("2026-11-01T10:15:00Z"))).toMatch(/^01\/11\/2026, 3:45\s?pm$/i);
  });
});

describe("formatTime", () => {
  it.each([
    ["08:00", "8:00 AM"],
    ["12:00", "12:00 PM"],
    ["12:30", "12:30 PM"],
    ["13:05", "1:05 PM"],
    ["20:00", "8:00 PM"],
    ["00:00", "12:00 AM"],
  ])("formats %s as %s", (input, expected) => {
    expect(formatTime(input)).toBe(expected);
  });
});

describe("normalizeIndianMobile", () => {
  it.each([
    "9876543210",
    "98765 43210",
    "+91 98765 43210",
    "+91-98765-43210",
    "098765 43210",
    "919876543210",
  ])("normalises %j to E.164", (input) => {
    expect(normalizeIndianMobile(input)).toBe("+919876543210");
  });

  it.each(["", "12345", "5876543210", "987654321", "98765432100", "+1 415 555 0100", "abcdefghij"])(
    "returns null for %j",
    (input) => {
      expect(normalizeIndianMobile(input)).toBeNull();
    },
  );
});

describe("formatIndianPhone", () => {
  it("groups an E.164 Indian number for display", () => {
    expect(formatIndianPhone("+919876543210")).toBe("+91 98765 43210");
  });

  it("returns anything else unchanged", () => {
    expect(formatIndianPhone("+14155550100")).toBe("+14155550100");
  });

  it("round-trips with normalizeIndianMobile", () => {
    expect(formatIndianPhone(normalizeIndianMobile("098765 43210")!)).toBe("+91 98765 43210");
  });
});

describe("whatsappUrl", () => {
  const base = `https://wa.me/${siteConfig.contact.whatsapp}`;

  it("links to the clinic's WhatsApp number", () => {
    expect(whatsappUrl()).toBe(base);
  });

  it("URL-encodes a prefilled message", () => {
    expect(whatsappUrl("Hi & hello?")).toBe(`${base}?text=Hi%20%26%20hello%3F`);
  });
});

describe("formatAddressLines", () => {
  it("returns the address from the config as three display lines", () => {
    const { address } = siteConfig.contact;
    const lines = formatAddressLines();
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe(address.line1);
    expect(lines[2]).toContain(address.pincode);
  });
});
