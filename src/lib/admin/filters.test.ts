import { describe, expect, it } from "vitest";
import { getReceivedSince } from "./filters";

describe("getReceivedSince", () => {
  // 20:00 UTC on 1 Nov is 01:30 on 2 Nov in India.
  const now = new Date("2026-11-01T20:00:00.000Z");

  it("means any time when no period is chosen", () => {
    expect(getReceivedSince(undefined, now)).toBeUndefined();
  });

  it("starts 'today' at midnight in the clinic's time zone, not UTC", () => {
    // Midnight IST on 2 Nov is 18:30 UTC on 1 Nov.
    expect(getReceivedSince("today", now)?.toISOString()).toBe("2026-11-01T18:30:00.000Z");
  });

  it("counts rolling days back from now", () => {
    expect(getReceivedSince("7d", now)?.toISOString()).toBe("2026-10-25T20:00:00.000Z");
    expect(getReceivedSince("30d", now)?.toISOString()).toBe("2026-10-02T20:00:00.000Z");
  });
});
