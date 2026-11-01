import { Button, Heading, Link, Section, Text } from "@react-email/components";
import { getServiceName, siteConfig } from "@/config/site.config";
import { formatAddressLines, formatCalendarDate, formatIndianPhone } from "@/lib/format";
import { absoluteUrl } from "@/lib/site-url";
import {
  DetailTable,
  EmailLayout,
  MultilineText,
  emailStyles,
  openingHoursLines,
  type DetailRowData,
} from "./email-layout";
import { getFirstName, getTimeSlotLabel, type EnquiryEmailData } from "./enquiry-email-data";

/**
 * Acknowledgement sent to the patient. Data minimisation: it confirms what is
 * needed to recognise the enquiry but deliberately does NOT echo back the
 * free-text message, which may contain health details and would otherwise sit
 * in another inbox (and any mail server in between).
 */
export function EnquiryConfirmationEmail({ enquiry }: { enquiry: EnquiryEmailData }) {
  const { contact, booking } = siteConfig;

  const rows: DetailRowData[] = [
    { label: "Reference", value: enquiry.reference },
    { label: "Service", value: getServiceName(enquiry.service) },
  ];
  if (enquiry.preferredDate) {
    rows.push({ label: "Preferred date", value: formatCalendarDate(enquiry.preferredDate) });
  }
  if (enquiry.preferredTime) {
    rows.push({ label: "Preferred time", value: getTimeSlotLabel(enquiry.preferredTime) });
  }

  return (
    <EmailLayout
      preview={`We've received your enquiry ${enquiry.reference}. We'll call you ${booking.responseTimeLabel}.`}
    >
      <Heading as="h1" style={emailStyles.h1}>
        {`Thank you, ${getFirstName(enquiry.name)}`}
      </Heading>
      <Text style={emailStyles.text}>
        We&apos;ve received your enquiry. We will call you on{" "}
        <strong>{formatIndianPhone(enquiry.phone)}</strong> {booking.responseTimeLabel} to confirm an
        appointment time that suits you.
      </Text>

      <DetailTable rows={rows} />

      <Text style={emailStyles.text}>
        Please quote your reference <strong>{enquiry.reference}</strong> if you get in touch. If your plans
        change, call us on{" "}
        <Link href={`tel:${contact.phoneE164}`} style={emailStyles.link}>
          {contact.phone}
        </Link>{" "}
        or simply reply to this email.
      </Text>

      <Heading as="h2" style={emailStyles.h2}>
        Finding us
      </Heading>
      <Text style={emailStyles.text}>
        <MultilineText text={formatAddressLines().join("\n")} />
      </Text>

      <Heading as="h2" style={emailStyles.h2}>
        Opening hours
      </Heading>
      <Text style={emailStyles.text}>
        <MultilineText text={openingHoursLines().join("\n")} />
      </Text>

      <Section style={{ margin: "8px 0 24px" }}>
        <Button href={absoluteUrl("/")} style={emailStyles.button}>
          Visit our website
        </Button>
      </Section>

      <Text style={emailStyles.small}>
        Didn&apos;t make this enquiry? Reply to this email and we will delete your details.
      </Text>
    </EmailLayout>
  );
}

export function buildEnquiryConfirmationEmail(enquiry: EnquiryEmailData) {
  return {
    template: "enquiry-confirmation",
    subject: `We've received your enquiry (${enquiry.reference}) | ${siteConfig.name}`,
    react: <EnquiryConfirmationEmail enquiry={enquiry} />,
    // Replies from the patient should reach the front desk, not the sending address.
    replyTo: siteConfig.contact.email,
  };
}
