import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { siteConfig } from "@/config/site.config";
import { buildClinicStructuredData } from "./clinic-structured-data";

type Node = Record<string, unknown>;

function build() {
  const data = buildClinicStructuredData();
  const graph = data["@graph"] as Node[];
  return {
    data,
    clinic: graph.find((node) => node["@type"] === siteConfig.seo.schemaType)!,
    website: graph.find((node) => node["@type"] === "WebSite")!,
  };
}

describe("buildClinicStructuredData", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://clinic.example");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("describes the clinic as a schema.org Physiotherapy business with absolute URLs", () => {
    const { data, clinic } = build();
    expect(data["@context"]).toBe("https://schema.org");
    expect(clinic).toMatchObject({
      "@type": "Physiotherapy",
      "@id": "https://clinic.example/#clinic",
      name: siteConfig.name,
      url: "https://clinic.example/",
      telephone: siteConfig.contact.phoneE164,
      email: siteConfig.contact.email,
      currenciesAccepted: "INR",
      priceRange: siteConfig.seo.priceRange,
    });
    expect(clinic.telephone).toMatch(/^\+91[6-9]\d{9}$/);
    for (const url of [clinic.logo, ...(clinic.image as string[])]) {
      expect(url).toMatch(/^https:\/\/clinic\.example\//);
    }
  });

  it("uses the configured Indian postal address and coordinates", () => {
    const { address, geo } = siteConfig.contact;
    expect(build().clinic).toMatchObject({
      address: {
        "@type": "PostalAddress",
        addressLocality: address.city,
        addressRegion: address.state,
        postalCode: address.pincode,
        addressCountry: "IN",
      },
      geo: { "@type": "GeoCoordinates", latitude: geo.latitude, longitude: geo.longitude },
      areaServed: { "@type": "City", name: "Hyderabad" },
    });
  });

  it("lists opening hours in 24-hour time for every configured period", () => {
    const hours = build().clinic.openingHoursSpecification as Node[];
    expect(hours).toHaveLength(siteConfig.contact.hours.length);
    for (const [index, period] of siteConfig.contact.hours.entries()) {
      expect(hours[index]).toEqual({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [...period.days],
        opens: period.opens,
        closes: period.closes,
      });
    }
  });

  it("offers every service with its starting price in INR", () => {
    const offers = build().clinic.makesOffer as Node[];
    expect(offers).toHaveLength(siteConfig.services.length);
    for (const [index, service] of siteConfig.services.entries()) {
      expect(offers[index]).toMatchObject({
        "@type": "Offer",
        priceSpecification: { minPrice: service.priceFromInr, priceCurrency: "INR" },
        itemOffered: {
          "@type": "Service",
          name: service.name,
          provider: { "@id": "https://clinic.example/#clinic" },
        },
      });
    }
  });

  it("links the website to the clinic as its publisher", () => {
    expect(build().website).toMatchObject({
      url: "https://clinic.example/",
      inLanguage: siteConfig.locale.htmlLang,
      publisher: { "@id": "https://clinic.example/#clinic" },
    });
  });
});
