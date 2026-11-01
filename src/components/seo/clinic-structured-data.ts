import { siteConfig } from "@/config/site.config";
import { formatInr } from "@/lib/format";
import { absoluteUrl } from "@/lib/site-url";
import { appIconUrl, manifestIcons } from "./app-icons";
import { defaultOgImage } from "./og-image";
import type { JsonLdObject } from "./serialize-json-ld";

/**
 * schema.org description of the clinic and the website, built entirely from
 * `siteConfig` so search engines see exactly what the pages show.
 *
 * Emitted as one `@graph` with stable `@id`s, so the WebSite node can refer to
 * the clinic as its publisher and each service to the clinic as its provider.
 */
export function buildClinicStructuredData(): JsonLdObject {
  const { contact, locale, seo } = siteConfig;
  const { address } = contact;
  const clinicId = absoluteUrl("/#clinic");
  const largestIcon = manifestIcons[manifestIcons.length - 1]!;

  const clinic: JsonLdObject = {
    // "Physiotherapy" is a schema.org MedicalBusiness subtype (and so a LocalBusiness).
    "@type": seo.schemaType,
    "@id": clinicId,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    slogan: siteConfig.tagline,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    logo: absoluteUrl(appIconUrl(largestIcon)),
    image: [
      ...Object.values(siteConfig.images).map((image) => absoluteUrl(image.src)),
      absoluteUrl(defaultOgImage.url),
    ],
    telephone: contact.phoneE164,
    email: contact.email,
    foundingDate: String(siteConfig.foundedYear),
    address: {
      "@type": "PostalAddress",
      streetAddress: [address.line1, address.line2, address.locality].join(", "),
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.pincode,
      addressCountry: address.countryCode,
    },
    geo: { "@type": "GeoCoordinates", latitude: contact.geo.latitude, longitude: contact.geo.longitude },
    hasMap: contact.mapsUrl,
    openingHoursSpecification: contact.hours.map((hours) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: hours.days,
      opens: hours.opens,
      closes: hours.closes,
    })),
    priceRange: seo.priceRange,
    currenciesAccepted: locale.currency,
    areaServed: {
      "@type": "City",
      name: address.city,
      containedInPlace: { "@type": "State", name: address.state },
    },
    makesOffer: siteConfig.services.map((service) => ({
      "@type": "Offer",
      url: absoluteUrl("/services"),
      description: `From ${formatInr(service.priceFromInr)} per ${service.durationMinutes}-minute session`,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        // Config prices are starting prices, hence minPrice rather than price.
        minPrice: service.priceFromInr,
        priceCurrency: locale.currency,
        // One session of the stated length (UN/CEFACT unit code "MIN" = minute).
        referenceQuantity: { "@type": "QuantitativeValue", value: service.durationMinutes, unitCode: "MIN" },
      },
      itemOffered: {
        "@type": "Service",
        name: service.name,
        description: service.description,
        provider: { "@id": clinicId },
      },
    })),
  };

  const website: JsonLdObject = {
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    url: absoluteUrl("/"),
    name: siteConfig.name,
    inLanguage: locale.htmlLang,
    publisher: { "@id": clinicId },
  };

  return { "@context": "https://schema.org", "@graph": [clinic, website] };
}

/** FAQPage data for the services page, mirroring the FAQ list rendered there. */
export function buildFaqStructuredData(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: siteConfig.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
