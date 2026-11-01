import { describe, expect, it } from "vitest";
import { bookServiceHref, formatSessionLength, formatSessionPrice } from "./service-meta";

describe("service meta formatting", () => {
  it("describes the session length", () => {
    expect(formatSessionLength({ durationMinutes: 45 })).toBe("45 min session");
  });

  it("formats the starting price in rupees with Indian digit grouping", () => {
    expect(formatSessionPrice({ priceFromInr: 900 })).toBe("From ₹900 per session");
    expect(formatSessionPrice({ priceFromInr: 150000 })).toBe("From ₹1,50,000 per session");
  });

  it("links to the enquiry form with the service pre-selected", () => {
    expect(bookServiceHref({ slug: "sports-injury" })).toEqual({
      pathname: "/contact",
      query: { service: "sports-injury" },
    });
  });
});
