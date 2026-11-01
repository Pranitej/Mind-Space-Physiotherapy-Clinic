import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type { CSSProperties, ReactNode } from "react";
import { siteConfig } from "@/config/site.config";
import { formatAddressLines, formatTime } from "@/lib/format";
import { absoluteUrl } from "@/lib/site-url";

/**
 * Shared shell for transactional emails. Email clients ignore stylesheets and
 * web fonts, so everything is an inline style using the brand palette from
 * the site config and widely available fallback fonts.
 */
const colors = siteConfig.theme.colors;

const fontSans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const fontSerif = "Georgia, 'Times New Roman', serif";

export const emailStyles = {
  body: { margin: 0, padding: "24px 0", backgroundColor: colors.background, fontFamily: fontSans },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
    overflow: "hidden",
  },
  header: { backgroundColor: colors.primary, padding: "24px 32px" },
  brand: {
    margin: 0,
    color: colors.primaryForeground,
    fontFamily: fontSerif,
    fontSize: "22px",
    fontWeight: 600,
  },
  tagline: { margin: "4px 0 0", color: colors.primarySoft, fontSize: "13px", letterSpacing: "0.04em" },
  content: { padding: "32px" },
  h1: {
    margin: "0 0 16px",
    color: colors.primary,
    fontFamily: fontSerif,
    fontSize: "26px",
    lineHeight: "1.25",
  },
  h2: {
    margin: "28px 0 8px",
    color: colors.primary,
    fontFamily: fontSerif,
    fontSize: "18px",
    lineHeight: "1.3",
  },
  text: { margin: "0 0 16px", color: colors.foreground, fontSize: "16px", lineHeight: "1.6" },
  small: { margin: "0 0 8px", color: colors.muted, fontSize: "13px", lineHeight: "1.6" },
  link: { color: colors.primary, textDecoration: "underline" },
  button: {
    display: "inline-block",
    padding: "12px 24px",
    borderRadius: "999px",
    backgroundColor: colors.accent,
    color: colors.accentForeground,
    fontSize: "15px",
    fontWeight: 600,
    textDecoration: "none",
  },
  detailBox: {
    margin: "8px 0 24px",
    padding: "8px 20px",
    backgroundColor: colors.primarySoft,
    borderRadius: "10px",
  },
  detailLabel: {
    width: "150px",
    padding: "8px 12px 8px 0",
    color: colors.muted,
    fontSize: "14px",
    verticalAlign: "top",
  },
  detailValue: {
    padding: "8px 0",
    color: colors.foreground,
    fontSize: "15px",
    fontWeight: 600,
    verticalAlign: "top",
  },
  hr: { margin: "0", borderColor: colors.border },
  footer: { padding: "24px 32px", backgroundColor: colors.background },
} satisfies Record<string, CSSProperties>;

export interface DetailRowData {
  label: string;
  value: ReactNode;
}

/** Marks label cells so the plain-text conversion can write "Label: value" (see send-email.ts). */
export const DETAIL_LABEL_CLASS = "detail-label";

/** Label / value pairs rendered as a table, the only layout every email client agrees on. */
export function DetailTable({ rows }: { rows: ReadonlyArray<DetailRowData> }) {
  return (
    <Section style={emailStyles.detailBox}>
      {rows.map((row) => (
        <Row key={row.label}>
          <Column className={DETAIL_LABEL_CLASS} style={emailStyles.detailLabel}>
            {row.label}
          </Column>
          <Column style={emailStyles.detailValue}>{row.value}</Column>
        </Row>
      ))}
    </Section>
  );
}

/** Keeps the author's line breaks without relying on `white-space` support. */
export function MultilineText({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);
  return (
    <>
      {lines.map((line, index) => (
        <span key={index}>
          {line}
          {index < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

export function openingHoursLines(): string[] {
  return siteConfig.contact.hours.map(
    (slot) => `${slot.label}: ${formatTime(slot.opens)} – ${formatTime(slot.closes)}`,
  );
}

export function EmailLayout({ preview, children }: { preview: string; children: ReactNode }) {
  const { contact } = siteConfig;
  const websiteUrl = absoluteUrl("/");

  return (
    <Html lang={siteConfig.locale.htmlLang}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={emailStyles.body}>
        <Container style={emailStyles.container}>
          <Section style={emailStyles.header}>
            <Text style={emailStyles.brand}>{siteConfig.name}</Text>
            <Text style={emailStyles.tagline}>{siteConfig.tagline}</Text>
          </Section>

          <Section style={emailStyles.content}>{children}</Section>

          <Hr style={emailStyles.hr} />
          <Section style={emailStyles.footer}>
            <Text style={{ ...emailStyles.small, color: colors.foreground, fontWeight: 600 }}>
              {siteConfig.name}
            </Text>
            <Text style={emailStyles.small}>{formatAddressLines().join(", ")}</Text>
            <Text style={emailStyles.small}>
              <Link href={`tel:${contact.phoneE164}`} style={emailStyles.link}>
                {contact.phone}
              </Link>
              {" · "}
              <Link href={`mailto:${contact.email}`} style={emailStyles.link}>
                {contact.email}
              </Link>
              {" · "}
              <Link href={websiteUrl} style={emailStyles.link}>
                {new URL(websiteUrl).host}
              </Link>
            </Text>
            {siteConfig.features.demoNotice && (
              <Text style={emailStyles.small}>
                This message was sent from a demonstration website. {siteConfig.name} is a fictional clinic.
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
