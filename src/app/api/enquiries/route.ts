import { after, type NextRequest } from "next/server";
import { siteConfig } from "@/config/site.config";
import { generateReference } from "@/lib/enquiries/enquiry.repository";
import { enquiryFormSchema, type EnquiryCreatedResponse } from "@/lib/enquiries/enquiry.schema";
import { createEnquiry, sendEnquiryNotifications } from "@/lib/enquiries/enquiry.service";
import { handleRouteError, jsonOk, validationError } from "@/lib/http/responses";
import { logger } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { assertSameOrigin, getClientIp, hashIp, readJsonBody } from "@/lib/security/request";

/**
 * POST /api/enquiries — public enquiry / booking request.
 *
 * Checks run cheapest-first so abusive traffic is rejected before it costs a
 * body parse or a database write. Only POST is exported; Next.js answers any
 * other method with 405.
 */
export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);

    const ipHash = hashIp(getClientIp(request));
    await enforceRateLimit("enquiry", ipHash, siteConfig.security.rateLimits.enquiry);

    const body = await readJsonBody(request);
    const parsed = enquiryFormSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    if (parsed.data.website) {
      // Answer exactly like a real success so the bot learns nothing; store nothing.
      logger.warn("enquiry.honeypot_triggered");
      return jsonOk<EnquiryCreatedResponse>({ reference: generateReference() }, { status: 201 });
    }

    const enquiry = await createEnquiry(parsed.data, {
      ipHash,
      userAgent: request.headers.get("user-agent"),
    });
    logger.info("enquiry.created", { reference: enquiry.reference, service: enquiry.service });

    // Email delivery runs after the response is sent, so the patient never waits
    // on (or sees an error from) the email provider. Outcomes are recorded on the enquiry.
    after(() => sendEnquiryNotifications(enquiry));

    return jsonOk<EnquiryCreatedResponse>({ reference: enquiry.reference }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "enquiry.create_failed");
  }
}
