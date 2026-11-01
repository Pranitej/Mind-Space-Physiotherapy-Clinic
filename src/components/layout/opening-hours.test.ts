import { describe, expect, it } from "vitest";
import { formatHoursRange, getTodaysHours } from "./opening-hours";

describe("getTodaysHours", () => {
  it("uses the clinic's time zone, not UTC", () => {
    // Sunday 20:00 UTC is already Monday 01:30 in India.
    const hours = getTodaysHours(new Date("2026-11-01T20:00:00Z"));
    expect(hours?.days).toContain("Monday");
    expect(hours?.days).not.toContain("Sunday");
  });

  it("returns Sunday hours on a Sunday morning in India", () => {
    const hours = getTodaysHours(new Date("2026-11-01T05:00:00Z"));
    expect(hours?.days).toContain("Sunday");
  });
});

describe("formatHoursRange", () => {
  it("formats a 24h range as Indian 12h times", () => {
    expect(formatHoursRange({ opens: "08:00", closes: "20:00" })).toBe("8:00 AM – 8:00 PM");
    expect(formatHoursRange({ opens: "09:30", closes: "13:00" })).toBe("9:30 AM – 1:00 PM");
  });
});
