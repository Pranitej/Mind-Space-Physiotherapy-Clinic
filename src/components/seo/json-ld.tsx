import { buildClinicStructuredData } from "./clinic-structured-data";
import { serializeJsonLd, type JsonLdObject } from "./serialize-json-ld";

interface JsonLdProps {
  data: JsonLdObject;
  /** Per-request CSP nonce, so every <script> on the page satisfies the policy. */
  nonce?: string;
}

/**
 * Renders schema.org structured data. The payload is built from trusted config
 * and escaped by `serializeJsonLd`, which is what makes raw HTML injection
 * safe here.
 */
export function JsonLd({ data, nonce }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

/** Site-wide clinic and website structured data, rendered once by the root layout. */
export function ClinicJsonLd({ nonce }: { nonce?: string }) {
  return <JsonLd data={buildClinicStructuredData()} nonce={nonce} />;
}
