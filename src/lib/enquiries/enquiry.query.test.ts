import { describe, expect, it } from "vitest";
import { buildEnquiryFilter, buildSortStages, isNameSort, NO_PREFERRED_DATE_FIELD } from "./enquiry.query";

const now = new Date("2026-11-01T06:00:00.000Z");

describe("buildEnquiryFilter", () => {
  it("matches everything without filters", () => {
    expect(buildEnquiryFilter({}, now)).toEqual({});
  });

  it("combines status, service and received period", () => {
    expect(buildEnquiryFilter({ status: "new", service: "sports-injury", period: "7d" }, now)).toEqual({
      status: "new",
      service: "sports-injury",
      createdAt: { $gte: new Date("2026-10-25T06:00:00.000Z") },
    });
  });

  it("searches name, email, reference and message case-insensitively", () => {
    const filter = buildEnquiryFilter({ search: "  Priya " }, now);
    const clauses = filter.$or ?? [];
    expect(clauses.map((clause) => Object.keys(clause)[0])).toEqual([
      "name",
      "email",
      "reference",
      "message",
    ]);
    const namePattern = (clauses[0] as { name: RegExp }).name;
    expect(namePattern.test("priya sharma")).toBe(true);
    expect(namePattern.flags).toContain("i");
  });

  it("matches phone numbers by digits, however they are typed", () => {
    const clauses = buildEnquiryFilter({ search: "+91 98765-43210" }, now).$or ?? [];
    const phone = clauses.find((clause) => "phone" in clause) as { phone: RegExp } | undefined;
    expect(phone?.phone.test("+919876543210")).toBe(true);
  });

  it("skips the phone clause for searches with too few digits", () => {
    const clauses = buildEnquiryFilter({ search: "MS-2" }, now).$or ?? [];
    expect(clauses.some((clause) => "phone" in clause)).toBe(false);
  });

  it("treats regex syntax in the search as literal text", () => {
    const clauses = buildEnquiryFilter({ search: ".*(a+)+$" }, now).$or ?? [];
    const namePattern = (clauses[0] as { name: RegExp }).name;
    expect(namePattern.test("anything at all")).toBe(false);
    expect(namePattern.test("literally .*(a+)+$ here")).toBe(true);
  });

  it("ignores a blank search", () => {
    expect(buildEnquiryFilter({ search: "   " }, now)).toEqual({});
  });
});

describe("buildSortStages", () => {
  it("defaults to newest first", () => {
    expect(buildSortStages()).toEqual([{ $sort: { createdAt: -1 } }]);
  });

  it("breaks name ties by newest first", () => {
    expect(buildSortStages("name-desc")).toEqual([{ $sort: { name: -1, createdAt: -1 } }]);
  });

  it("puts enquiries without a preferred date last", () => {
    const [addFields, sort] = buildSortStages("preferred-date");
    expect(addFields).toHaveProperty(`$addFields.${NO_PREFERRED_DATE_FIELD}`);
    expect(sort).toEqual({ $sort: { [NO_PREFERRED_DATE_FIELD]: 1, preferredDate: 1, createdAt: -1 } });
  });

  it("flags only the name sorts for case-insensitive collation", () => {
    expect(isNameSort("name-asc")).toBe(true);
    expect(isNameSort("oldest")).toBe(false);
    expect(isNameSort(undefined)).toBe(false);
  });
});
