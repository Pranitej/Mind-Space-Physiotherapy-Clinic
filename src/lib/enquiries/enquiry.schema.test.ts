import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { siteConfig } from "@/config/site.config";
import { CONSENT_ERROR, PHONE_ERROR, enquiryFormSchema, getPreferredDateRange } from "./enquiry.schema";

// Pinned clock: 1 Nov 2026, 10:00 IST (04:30 UTC). "Today" for the clinic is 2026-11-01.
const NOW = new Date("2026-11-01T04:30:00Z");

const validInput = {
  name: "Ravi Kumar",
  email: "  Ravi.Kumar@Example.COM ",
  phone: "98765 43210",
  service: "back-neck-pain",
  preferredDate: "2026-11-05",
  preferredTime: "morning",
  message: "  Lower back pain for three weeks.  ",
  consent: true,
  website: "",
};

/** First error message per field, or {} when the input is valid. */
function errorsFor(overrides: Record<string, unknown>): Record<string, string> {
  const result = enquiryFormSchema.safeParse({ ...validInput, ...overrides });
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) errors[issue.path.join(".")] ??= issue.message;
  return errors;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("enquiryFormSchema", () => {
  it("accepts a valid enquiry and normalises it", () => {
    expect(enquiryFormSchema.parse(validInput)).toEqual({
      name: "Ravi Kumar",
      email: "ravi.kumar@example.com",
      phone: "+919876543210",
      service: "back-neck-pain",
      preferredDate: "2026-11-05",
      preferredTime: "morning",
      message: "Lower back pain for three weeks.",
      consent: true,
      website: "",
    });
  });

  it("is idempotent, so the client can post already-parsed values", () => {
    const once = enquiryFormSchema.parse(validInput);
    expect(enquiryFormSchema.parse(once)).toEqual(once);
  });

  describe("name", () => {
    it.each(["Ananya Rao", "Dr. K. Reddy", "D'Souza", "D’Souza", "Mary-Jane", "రాము", "अनन्या", "Zoë"])(
      "accepts %s",
      (name) => {
        expect(errorsFor({ name })).toEqual({});
      },
    );

    it("trims and collapses internal whitespace", () => {
      expect(enquiryFormSchema.parse({ ...validInput, name: "  Ravi \t  Kumar " }).name).toBe("Ravi Kumar");
    });

    it.each(["", "A", "Ravi123", "<script>", "Ravi@Kumar", "-Ravi", "a".repeat(81)])("rejects %j", (name) => {
      expect(errorsFor({ name })).toHaveProperty("name");
    });
  });

  describe("email", () => {
    it.each(["not-an-email", "ravi@", "@example.com", "ravi@example", ""])("rejects %j", (email) => {
      expect(errorsFor({ email })).toHaveProperty("email");
    });

    it("rejects addresses longer than 254 characters", () => {
      expect(errorsFor({ email: `${"a".repeat(250)}@example.com` })).toHaveProperty("email");
    });
  });

  describe("phone", () => {
    it.each([
      "+91 98765 43210",
      "098765 43210",
      "9876543210",
      "+91-98765-43210",
      "919876543210",
      "(98765) 43210",
    ])("normalises %j to E.164", (phone) => {
      expect(enquiryFormSchema.parse({ ...validInput, phone }).phone).toBe("+919876543210");
    });

    it.each([
      "",
      "12345",
      "5876543210",
      "98765 4321",
      "98765 432100",
      "+1 415 555 0100",
      "+92 98765 43210",
      "phone",
    ])("rejects %j with a clear message", (phone) => {
      expect(errorsFor({ phone })).toEqual({ phone: PHONE_ERROR });
    });
  });

  describe("service", () => {
    it("accepts the general assessment option", () => {
      expect(errorsFor({ service: siteConfig.booking.generalAssessment.slug })).toEqual({});
    });

    it.each(["", "acupuncture", "BACK-NECK-PAIN", undefined])("rejects %j", (service) => {
      expect(errorsFor({ service })).toHaveProperty("service");
    });
  });

  describe("preferredDate", () => {
    const { maxDaysAhead } = siteConfig.booking;

    it("accepts today and the last bookable day", () => {
      const { min, max } = getPreferredDateRange();
      expect(min).toBe("2026-11-01");
      expect(max).toBe("2026-12-31");
      expect(maxDaysAhead).toBe(60);
      expect(errorsFor({ preferredDate: min })).toEqual({});
      expect(errorsFor({ preferredDate: max })).toEqual({});
    });

    it("rejects a date in the past", () => {
      expect(errorsFor({ preferredDate: "2026-10-31" })).toEqual({
        preferredDate: "Please choose today or a later date",
      });
    });

    it("rejects a date too far ahead", () => {
      expect(errorsFor({ preferredDate: "2027-01-01" })).toEqual({
        preferredDate: `Please choose a date within the next ${maxDaysAhead} days`,
      });
    });

    it.each(["2026-02-30", "2026-13-01", "05/11/2026", "tomorrow"])(
      "rejects the invalid date %j",
      (preferredDate) => {
        expect(errorsFor({ preferredDate })).toEqual({ preferredDate: "Enter a valid date" });
      },
    );

    it("uses the clinic's time zone for today, not UTC", () => {
      // 00:30 IST on 1 Nov is still 31 Oct in UTC; 31 Oct must already be in the past.
      vi.setSystemTime(new Date("2026-10-31T19:00:00Z"));
      expect(getPreferredDateRange().min).toBe("2026-11-01");
      expect(errorsFor({ preferredDate: "2026-10-31" })).toHaveProperty("preferredDate");
    });

    it("re-evaluates today on every parse instead of caching it", () => {
      vi.setSystemTime(new Date("2026-11-10T04:30:00Z"));
      expect(errorsFor({ preferredDate: "2026-11-05" })).toHaveProperty("preferredDate");
    });
  });

  describe("preferredTime", () => {
    it.each(siteConfig.booking.timeSlots.map((slot) => slot.id))("accepts %s", (preferredTime) => {
      expect(errorsFor({ preferredTime })).toEqual({});
    });

    it("rejects an unknown slot", () => {
      expect(errorsFor({ preferredTime: "midnight" })).toHaveProperty("preferredTime");
    });
  });

  describe("message", () => {
    const { messageMaxLength } = siteConfig.booking;

    it("accepts a message at the maximum length", () => {
      expect(errorsFor({ message: "a".repeat(messageMaxLength) })).toEqual({});
    });

    it("rejects a message that is too long", () => {
      expect(errorsFor({ message: "a".repeat(messageMaxLength + 1) })).toHaveProperty("message");
    });
  });

  describe("consent", () => {
    it.each([false, undefined, "true", 1])("is required (%j)", (consent) => {
      expect(errorsFor({ consent })).toEqual({ consent: CONSENT_ERROR });
    });
  });

  it("turns empty optional fields into null", () => {
    const parsed = enquiryFormSchema.parse({
      ...validInput,
      preferredDate: "",
      preferredTime: "",
      message: "   ",
    });
    expect(parsed).toMatchObject({ preferredDate: null, preferredTime: null, message: null });
  });

  it("treats omitted optional fields as null", () => {
    const { name, email, phone, service, consent } = validInput;
    expect(enquiryFormSchema.parse({ name, email, phone, service, consent })).toMatchObject({
      preferredDate: null,
      preferredTime: null,
      message: null,
    });
  });

  it("passes the honeypot value through so the API can detect bots", () => {
    expect(enquiryFormSchema.parse({ ...validInput, website: "https://spam.example" }).website).toBe(
      "https://spam.example",
    );
  });
});
