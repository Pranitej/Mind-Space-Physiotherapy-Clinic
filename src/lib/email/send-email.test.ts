import { render } from "@react-email/components";
import { ObjectId } from "mongodb";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { siteConfig } from "@/config/site.config";
import type { EnquiryDocument } from "@/lib/enquiries/enquiry.types";
import type { ServerEnv } from "@/lib/env";
import { EmailDeliveryError, renderEmail, sanitizeSubject, sendEmail } from "./send-email";
import { buildClinicNotificationEmail } from "./templates/clinic-notification";
import { buildEnquiryConfirmationEmail } from "./templates/enquiry-confirmation";

const { sendMock, envMock } = vi.hoisted(() => ({ sendMock: vi.fn(), envMock: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));
vi.mock("@/lib/env", () => ({ getServerEnv: envMock, isProduction: false }));

function mockEnv(overrides: Partial<ServerEnv> = {}) {
  envMock.mockReturnValue({
    NODE_ENV: "test",
    EMAIL_FROM: "MindSpace <hello@example.com>",
    ...overrides,
  } as ServerEnv);
}

const SENSITIVE_MESSAGE = "Recovering from ACL surgery on my left knee";

const enquiry: EnquiryDocument = {
  _id: new ObjectId(),
  reference: "MS-261101-7K3QX",
  name: "Dr. Ananya Rao",
  email: "ananya@example.com",
  phone: "+919876543210",
  service: "sports-injury",
  preferredDate: "2026-11-05",
  preferredTime: "evening",
  message: `${SENSITIVE_MESSAGE}\nSecond line`,
  status: "new",
  consentAt: new Date("2026-11-01T04:30:00Z"),
  source: { ipHash: "hash", userAgent: null },
  notifications: { patient: "pending", clinic: "pending" },
  createdAt: new Date("2026-11-01T04:30:00Z"),
  updatedAt: new Date("2026-11-01T04:30:00Z"),
};

beforeEach(() => {
  sendMock.mockReset();
  mockEnv();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
});

describe("sanitizeSubject", () => {
  it("removes CR/LF so a subject cannot inject extra headers", () => {
    expect(sanitizeSubject("Hello\r\nBcc: victim@example.com")).toBe("Hello Bcc: victim@example.com");
  });

  it("removes other control characters and Unicode line separators", () => {
    const lineSeparator = String.fromCharCode(0x2028);
    expect(sanitizeSubject(`A${String.fromCharCode(0)}B\tC${lineSeparator}D  E`)).toBe("A B C D E");
  });
});

describe("sendEmail", () => {
  const message = {
    template: "enquiry-confirmation",
    to: "ananya@example.com",
    subject: "Subject\nInjected: yes",
    react: buildEnquiryConfirmationEmail(enquiry).react,
    idempotencyKey: "enquiry-confirmation/MS-261101-7K3QX",
  };

  it("simulates delivery when no API key is configured", async () => {
    await expect(sendEmail(message)).resolves.toBe("simulated");
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("sends HTML and plain text through Resend with an idempotency key", async () => {
    mockEnv({ RESEND_API_KEY: "re_test_key" });
    sendMock.mockResolvedValue({ data: { id: "email_123" }, error: null, headers: null });

    await expect(sendEmail({ ...message, replyTo: "care@example.com" })).resolves.toBe("sent");

    const [payload, options] = sendMock.mock.calls[0]!;
    expect(payload).toMatchObject({
      from: "MindSpace <hello@example.com>",
      to: "ananya@example.com",
      subject: "Subject Injected: yes",
      replyTo: "care@example.com",
    });
    expect(payload.html).toContain("MS-261101-7K3QX");
    expect(payload.text).toContain("MS-261101-7K3QX");
    expect(payload.text).not.toContain("<");
    expect(options).toEqual({ idempotencyKey: "enquiry-confirmation/MS-261101-7K3QX" });
  });

  it("throws when Resend reports an error", async () => {
    mockEnv({ RESEND_API_KEY: "re_test_key" });
    sendMock.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "Invalid `to` field", statusCode: 422 },
      headers: null,
    });

    await expect(sendEmail(message)).rejects.toBeInstanceOf(EmailDeliveryError);
  });
});

describe("email templates", () => {
  /** The plain-text part exactly as it is sent. */
  async function renderText(element: ReactElement): Promise<string> {
    return (await renderEmail(element)).text;
  }

  it("confirmation greets by first name, shows the booking details and omits the free-text message", async () => {
    const email = buildEnquiryConfirmationEmail(enquiry);
    const text = await renderText(email.react);

    expect(email.subject).toContain(enquiry.reference);
    expect(email.replyTo).toBe(siteConfig.contact.email);
    expect(text).toContain("Thank you, Ananya");
    expect(text).toContain(`Reference: ${enquiry.reference}`);
    expect(text).toContain("Service: Sports Injury Rehab");
    expect(text).toContain("Preferred date: 05/11/2026");
    expect(text).toContain("Preferred time: Evening (4 PM – 8 PM)");
    expect(text).toContain("We will call you on +91 98765 43210 within one working day");
    expect(text).not.toContain("tel:");
    expect(text).not.toContain(SENSITIVE_MESSAGE);
  });

  it("clinic notification includes every field and replies go to the patient", async () => {
    const email = buildClinicNotificationEmail(enquiry);
    const text = await renderText(email.react);

    expect(email.replyTo).toBe(enquiry.email);
    expect(email.subject).not.toContain(enquiry.name);
    expect(text).toContain(`Name: ${enquiry.name}`);
    expect(text).toContain(`Email: ${enquiry.email}`);
    expect(text).toContain("Mobile: +91 98765 43210");
    expect(text).toMatch(/Received: 01\/11\/2026, 10:00\s?am/i);
    expect(text).toContain(SENSITIVE_MESSAGE);
    expect(text).toContain("Second line");
    expect(text).toContain("/admin");
  });

  it("escapes user-supplied content", async () => {
    const html = await render(
      buildClinicNotificationEmail({ ...enquiry, message: '<img src=x onerror="alert(1)">' }).react,
    );
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img");
  });
});
