import "server-only";
import { buildClinicNotificationEmail } from "@/lib/email/templates/clinic-notification";
import { buildEnquiryConfirmationEmail } from "@/lib/email/templates/enquiry-confirmation";
import { sendEmail, type EmailDeliveryStatus } from "@/lib/email/send-email";
import { getServerEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { insertEnquiry, setNotificationStatus } from "./enquiry.repository";
import type { EnquiryFormValues } from "./enquiry.schema";
import type { EnquiryDocument, NotificationChannel, NotificationStatus } from "./enquiry.types";

/**
 * Use cases for public enquiries. Route handlers stay thin (HTTP concerns
 * only); persistence lives in the repository and delivery in the email module.
 */

const USER_AGENT_MAX_LENGTH = 300;

export interface EnquiryRequestMeta {
  /** Keyed hash of the client IP (never the raw address). */
  ipHash: string;
  userAgent: string | null;
}

export async function createEnquiry(
  values: EnquiryFormValues,
  meta: EnquiryRequestMeta,
): Promise<EnquiryDocument> {
  // Fields are picked explicitly so nothing else in the payload (the honeypot,
  // the consent flag itself, or a future form field) reaches the database by accident.
  return insertEnquiry({
    name: values.name,
    email: values.email,
    phone: values.phone,
    service: values.service,
    preferredDate: values.preferredDate,
    preferredTime: values.preferredTime,
    message: values.message,
    consentAt: new Date(),
    source: {
      ipHash: meta.ipHash,
      userAgent: meta.userAgent ? meta.userAgent.slice(0, USER_AGENT_MAX_LENGTH) : null,
    },
  });
}

type DeliveryOutcome = EmailDeliveryStatus | "skipped";

function toNotificationStatus(result: PromiseSettledResult<DeliveryOutcome>): NotificationStatus {
  return result.status === "fulfilled" ? result.value : "failed";
}

/**
 * Sends the patient confirmation and the clinic alert, then records each
 * outcome on the enquiry so staff can see in the admin whether the patient was
 * actually emailed. Runs after the response has been sent, so it never throws:
 * every failure is logged (by reference only) and recorded instead.
 */
export async function sendEnquiryNotifications(enquiry: EnquiryDocument): Promise<void> {
  const { reference } = enquiry;

  try {
    const { CLINIC_NOTIFICATION_EMAIL } = getServerEnv();

    // Independent deliveries: one failing must not stop the other.
    const [patient, clinic] = await Promise.allSettled([
      sendEmail({
        ...buildEnquiryConfirmationEmail(enquiry),
        to: enquiry.email,
        idempotencyKey: `enquiry-confirmation/${reference}`,
      }),
      CLINIC_NOTIFICATION_EMAIL
        ? sendEmail({
            ...buildClinicNotificationEmail(enquiry),
            to: CLINIC_NOTIFICATION_EMAIL,
            idempotencyKey: `clinic-notification/${reference}`,
          })
        : Promise.resolve<DeliveryOutcome>("skipped"),
    ]);

    const results: [NotificationChannel, PromiseSettledResult<DeliveryOutcome>][] = [
      ["patient", patient],
      ["clinic", clinic],
    ];

    await Promise.all(
      results.map(async ([channel, result]) => {
        if (result.status === "rejected") {
          logger.error("enquiry.notification_failed", { reference, channel, error: result.reason });
        }
        try {
          await setNotificationStatus(enquiry._id, channel, toNotificationStatus(result));
        } catch (error) {
          logger.error("enquiry.notification_status_save_failed", { reference, channel, error });
        }
      }),
    );

    logger.info("enquiry.notifications_processed", {
      reference,
      patient: toNotificationStatus(patient),
      clinic: toNotificationStatus(clinic),
    });
  } catch (error) {
    // e.g. invalid environment configuration; the enquiry itself is already saved.
    logger.error("enquiry.notifications_crashed", { reference, error });
  }
}
