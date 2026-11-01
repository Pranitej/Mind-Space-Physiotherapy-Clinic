/** JSON-compatible values only, so nothing is silently dropped by JSON.stringify (undefined, functions). */
export type JsonLdValue = string | number | boolean | null | JsonLdObject | readonly JsonLdValue[];

export interface JsonLdObject {
  readonly [key: string]: JsonLdValue;
}

/**
 * Serialises structured data for embedding inside a <script> element.
 *
 * JSON.stringify alone is not safe there: a string containing "</script>" or
 * "<!--" would end or corrupt the element and let the rest be parsed as HTML.
 * Escaping the HTML-significant characters (plus the two JavaScript line
 * terminators) as JSON unicode escapes makes the payload inert to the HTML
 * parser while it still parses to exactly the same data.
 */
export function serializeJsonLd(data: JsonLdObject): string {
  return JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (char) => {
    return `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`;
  });
}
