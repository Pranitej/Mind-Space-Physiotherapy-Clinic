import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site.config";
import { getInitials } from "./initials";

describe("getInitials", () => {
  it("uses the first and last name and ignores the honorific", () => {
    expect(getInitials("Dr. Ananya Rao")).toBe("AR");
    expect(getInitials("Dr Karthik Reddy")).toBe("KR");
    expect(getInitials("Prof. Mary Anne Smith")).toBe("MS");
  });

  it("handles single names, lower case and stray whitespace", () => {
    expect(getInitials("  meera  ")).toBe("M");
    expect(getInitials("sana   fatima")).toBe("SF");
  });

  it("gives every configured team member a two-letter avatar", () => {
    for (const member of siteConfig.team) {
      expect(getInitials(member.name)).toMatch(/^[A-Z]{2}$/);
    }
  });
});
