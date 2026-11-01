import { Button, Heading, Link, Section, Text } from "@react-email/components";
import { getServiceName, siteConfig } from "@/config/site.config";
import { formatCalendarDate, formatDateTime, formatIndianPhone } from "@/lib/format";
import { absoluteUrl } from "@/lib/site-url";
import { DetailTable, EmailLayout, MultilineText, emailStyles } from "./email-layout";
import { getTimeSlotLabel, type EnquiryEmailData } from "./enquiry-email-data";

const NO_PREFERENCE = "No preference";

/** Internal alert to the clinic inbox with everything needed to call the patient back. */
export function ClinicNotificationEmail({ enquiry }: { enquiry: EnquiryEmailData }) {
  const serviceName = getServiceName(enquiry.service);

  return (
    <EmailLayout preview={`New enquiry ${enquiry.reference} for ${serviceName}`}>
      <Heading as="h1" style={emailStyles.h1}>
        New enquiry received
      </Heading>
      <Text style={emailStyles.text}>
        The patient has been told to expect a call {siteConfig.booking.responseTimeLabel}.
      </Text>

      <DetailTable
        rows={[
          { label: "Reference", value: enquiry.reference },
          { label: "Received", value: formatDateTime(enquiry.createdAt) },
          { label: "Name", value: enquiry.name },
          {
            label: "Mobile",
            value: (
              <Link href={`tel:${enquiry.phone}`} style={emailStyles.link}>
                {formatIndianPhone(enquiry.phone)}
              </Link>
            ),
          },
          {
            label: "Email",
            value: (
              <Link href={`mailto:${enquiry.email}`} style={emailStyles.link}>
                {enquiry.email}
              </Link>
            ),
          },
          { label: "Service", value: serviceName },
          {
            label: "Preferred date",
            value: enquiry.preferredDate ? formatCalendarDate(enquiry.preferredDate) : NO_PREFERENCE,
          },
          {
            label: "Preferred time",
            value: enquiry.preferredTime ? getTimeSlotLabel(enquiry.preferredTime) : NO_PREFERENCE,
          },
        ]}
      />

      <Heading as="h2" style={emailStyles.h2}>
        Message
      </Heading>
      <Text style={emailStyles.text}>
        {enquiry.message ? <MultilineText text={enquiry.message} /> : "No message provided."}
      </Text>

      <Section style={{ margin: "8px 0 24px" }}>
        <Button href={absoluteUrl("/admin")} style={emailStyles.button}>
          Open the admin dashboard
        </Button>
      </Section>

      <Text style={emailStyles.small}>
        Reply to this email to respond to the patient directly. It contains personal data: please do not
        forward it outside the clinic.
      </Text>
    </EmailLayout>
  );
}

export function buildClinicNotificationEmail(enquiry: EnquiryEmailData) {
  return {
    template: "clinic-notification",
    // No patient name in the subject: subjects show on lock screens and in notification previews.
    subject: `New enquiry ${enquiry.reference}: ${getServiceName(enquiry.service)}`,
    react: <ClinicNotificationEmail enquiry={enquiry} />,
    replyTo: enquiry.email,
  };
}
