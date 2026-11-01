import "server-only";
import { render, toPlainText } from "@react-email/components";
import type { ReactElement } from "react";
import { Resend } from "resend";
import { getServerEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { DETAIL_LABEL_CLASS } from "./templates/email-layout";

/**
 * Transactional email via Resend.
 *
 * Without RESEND_API_KEY the message is rendered but not sent ("simulated"),
 * so the full enquiry flow works in local development and demos without an
 * email provider account.
 */
export interface EmailMessage {
  /** Stable template id, used for logs and Resend tags. Never personal data. */
  template: string;
  to: string;
  subject: string;
  react: ReactElement;
  replyTo?: string;
  /**
   * Resend de-duplicates sends with the same key for 24 hours, so a retried
   * request (or a re-run background task) can never email someone twice.
   */
  idempotencyKey: string;
}

export type EmailDeliveryStatus = "sent" | "simulated";

/** Thrown when the provider rejects a message. Carries no recipient data. */
export class EmailDeliveryError extends Error {
  constructor(
    readonly template: string,
    readonly providerCode: string,
    readonly statusCode: number | null,
  ) {
    super(
      `Email provider rejected "${template}" (${providerCode}${statusCode ? `, HTTP ${statusCode}` : ""})`,
    );
    this.name = "EmailDeliveryError";
  }
}

/**
 * Header-injection hardening: a subject must be a single line. Subjects can
 * include user input (the patient's name), so strip every control character
 * and Unicode line/paragraph separator, then collapse whitespace.
 */
export function sanitizeSubject(subject: string): string {
  return subject
    .replace(/[\p{Cc}\p{Zl}\p{Zp}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// html-to-text ships without type declarations, so describe the slice of its
// formatter API used here rather than adding a @types dependency.
interface TextBuilder {
  addInline(text: string): void;
}
type FormatCallback = (
  element: { children: unknown[] },
  walk: (nodes: unknown[], builder: TextBuilder) => void,
  builder: TextBuilder,
) => void;

/** Writes a detail-table label as "Label: " so it does not run into its value. */
const formatDetailLabel: FormatCallback = (element, walk, builder) => {
  walk(element.children, builder);
  builder.addInline(": ");
};

const plainTextOptions: Parameters<typeof toPlainText>[1] = {
  selectors: [
    // html-to-text upper-cases headings by default, which reads as shouting.
    { selector: "h1", options: { uppercase: false } },
    { selector: "h2", options: { uppercase: false } },
    // The number is already shown as the link text; don't repeat it as a tel: URL.
    { selector: "a[href^='tel:']", format: "anchor", options: { ignoreHref: true } },
    { selector: `td.${DETAIL_LABEL_CLASS}`, format: "detailLabel" },
  ],
  formatters: { detailLabel: formatDetailLabel },
};

let resendClient: Resend | undefined;

function getResend(apiKey: string): Resend {
  resendClient ??= new Resend(apiKey);
  return resendClient;
}

/**
 * Renders once and derives the plain-text part from the HTML. Multipart
 * emails score better with spam filters and work in text-only clients.
 */
export async function renderEmail(react: ReactElement): Promise<{ html: string; text: string }> {
  const html = await render(react);
  return { html, text: toPlainText(html, plainTextOptions) };
}

export async function sendEmail(message: EmailMessage): Promise<EmailDeliveryStatus> {
  const env = getServerEnv();
  const subject = sanitizeSubject(message.subject);
  const { html, text } = await renderEmail(message.react);

  if (!env.RESEND_API_KEY) {
    logger.info("email.simulated", { template: message.template, subjectLength: subject.length });
    if (env.NODE_ENV === "development") {
      // Development-only preview so the flow can be demonstrated without a provider.
      // Never runs in production, where this would put personal data in the logs.
      console.info(
        `\n──── Simulated email: ${message.template} ────\nSubject: ${subject}\n\n${text}\n────\n`,
      );
    }
    return "simulated";
  }

  const { data, error } = await getResend(env.RESEND_API_KEY).emails.send(
    {
      from: env.EMAIL_FROM,
      to: message.to,
      subject,
      html,
      text,
      replyTo: message.replyTo,
      tags: [{ name: "template", value: message.template }],
    },
    { idempotencyKey: message.idempotencyKey },
  );

  if (error) throw new EmailDeliveryError(message.template, error.name, error.statusCode ?? null);

  logger.info("email.sent", { template: message.template, resendId: data.id });
  return "sent";
}
