import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "./serialize-json-ld";

describe("serializeJsonLd", () => {
  it("cannot be used to break out of the <script> element", () => {
    const output = serializeJsonLd({ name: "</script><script>alert(1)</script><!--" });
    expect(output).not.toMatch(/[<>]/);
    expect(output).toContain("\\u003c/script\\u003e");
  });

  it("escapes ampersands and JavaScript line terminators", () => {
    const output = serializeJsonLd({ text: "Physiotherapy & Rehab\u2028\u2029" });
    expect(output).not.toMatch(/[&\u2028\u2029]/);
    expect(output).toContain("\\u0026");
  });

  it("round-trips to the original data", () => {
    const data = {
      "@context": "https://schema.org",
      name: "<b>MindSpace</b> & co",
      priceRange: "₹₹",
      hours: ["Monday", "Sunday"],
      nested: { value: 1, flag: true, empty: null },
    };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});
