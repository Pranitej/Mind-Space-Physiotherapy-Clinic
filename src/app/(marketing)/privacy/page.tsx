import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageIntro } from "@/components/marketing/page-intro";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site.config";
import { formatAddressLines, formatCalendarDate, formatIndianPhone } from "@/lib/format";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata(siteConfig.pages.privacy.seo, "/privacy");

/** Enforced by a TTL index in the enquiry repository. */
const ENQUIRY_RETENTION_MONTHS = siteConfig.privacy.enquiryRetentionMonths;

interface PolicySection {
  id: string;
  title: string;
  body: ReactNode;
}

export default function PrivacyPage() {
  const { seo, lastUpdated } = siteConfig.pages.privacy;
  const { email, phoneE164 } = siteConfig.contact;
  const { rateLimits, session } = siteConfig.security;
  // Facts quoted in the notice are derived from the same config the code enforces.
  const rateLimitMinutes = Math.max(...Object.values(rateLimits).map((rule) => rule.windowSeconds)) / 60;
  const sessionHours = session.maxAgeSeconds / 3600;

  const emailLink = (
    <a href={`mailto:${email}`} className={linkClass}>
      {email}
    </a>
  );

  const sections: PolicySection[] = [
    {
      id: "who-we-are",
      title: "Who we are",
      body: (
        <>
          <p>
            {siteConfig.name} (“we”, “us”) runs this website and is the Data Fiduciary for the personal data
            you share through it, as defined in the Digital Personal Data Protection Act, 2023 (the “DPDP
            Act”). We are located at {formatAddressLines().join(", ")}.
          </p>
          <p>You can contact us about anything in this notice at {emailLink}.</p>
        </>
      ),
    },
    {
      id: "data-we-collect",
      title: "What we collect",
      body: (
        <>
          <p>When you send an enquiry using our booking form, we collect:</p>
          <ul className={listClass}>
            <li>your name;</li>
            <li>your mobile number;</li>
            <li>your email address;</li>
            <li>the service you are interested in;</li>
            <li>your preferred appointment date and time of day, if you choose them; and</li>
            <li>any message you choose to add.</li>
          </ul>
          <p>
            We also record when you gave your consent, and two technical details used only to protect the form
            from spam and abuse: a keyed, one-way hash of your IP address (we never store the address itself)
            and your browser’s user-agent string, which describes your browser and device type.
          </p>
          <p>
            Please don’t include detailed medical information in the message box. We will discuss your health
            in person at your assessment.
          </p>
          <p>
            We don’t use analytics, advertising or tracking cookies, and visitors to this website are not
            given any cookies. The only cookie we set is a strictly necessary sign-in cookie for authorised
            clinic staff using our admin area.
          </p>
        </>
      ),
    },
    {
      id: "purpose",
      title: "Why we use it",
      body: (
        <>
          <p>We use your enquiry details only to:</p>
          <ul className={listClass}>
            <li>respond to your enquiry and call or email you to schedule an appointment;</li>
            <li>send you an email confirming that we have received your enquiry; and</li>
            <li>keep the enquiry form secure and prevent misuse.</li>
          </ul>
          <p>
            We do not use your data for marketing, we do not sell it, and we do not share it with anyone for
            their own purposes.
          </p>
        </>
      ),
    },
    {
      id: "consent",
      title: "Our legal basis: your consent",
      body: (
        <>
          <p>
            We process your data on the basis of your consent, which you give by ticking the consent box on
            the enquiry form before you submit it (section 6 of the DPDP Act). Your consent covers only the
            purposes listed above. We cannot respond to an enquiry without it, so the form cannot be sent
            unless you agree.
          </p>
          <p>
            You can withdraw your consent at any time by emailing {emailLink}. Withdrawing is as easy as
            giving consent. We will then stop processing your enquiry and delete it, unless the law requires
            us to keep it. Withdrawal does not affect processing that took place before it.
          </p>
        </>
      ),
    },
    {
      id: "processors",
      title: "Who processes it for us",
      body: (
        <>
          <p>
            We use a small number of service providers (Data Processors). They handle personal data only on
            our instructions and under contract:
          </p>
          <ul className={listClass}>
            <li>
              <strong className="font-semibold text-foreground">MongoDB Atlas</strong> (MongoDB, Inc.):
              database hosting. Stores your enquiry.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Resend</strong>: email delivery. Sends your
              confirmation email and notifies our front desk of a new enquiry.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Vercel</strong>: website hosting. Runs this
              website and processes your request when you submit the form.
            </li>
          </ul>
          <p>
            These providers may process data on servers outside India. The DPDP Act permits this except to
            countries restricted by the Central Government, and we require our providers to protect your data
            to the standard described in this notice.
          </p>
        </>
      ),
    },
    {
      id: "retention",
      title: "How long we keep it",
      body: (
        <>
          <p>
            We delete enquiries {ENQUIRY_RETENTION_MONTHS} months after we receive them, unless you become a
            patient. If you do, your details become part of your patient record, which we keep for as long as
            clinical and legal record-keeping obligations require. We will explain this at your first visit.
          </p>
          <p>
            The anti-abuse counters linked to the hashed IP address expire automatically within{" "}
            {rateLimitMinutes} minutes.
          </p>
        </>
      ),
    },
    {
      id: "security",
      title: "How we protect it",
      body: (
        <ul className={listClass}>
          <li>
            All connections to this website are encrypted in transit with HTTPS (TLS), and browsers are
            instructed never to connect without it.
          </li>
          <li>Enquiries are stored in a database that is encrypted at rest.</li>
          <li>
            Access to enquiries is restricted to authorised clinic staff, through a password-protected admin
            area whose sign-ins expire after {sessionHours} hours.
          </li>
          <li>Your IP address is never stored; only a keyed hash of it is.</li>
          <li>
            If a personal data breach occurs, we will inform the Data Protection Board of India and everyone
            affected, as the DPDP Act requires.
          </li>
        </ul>
      ),
    },
    {
      id: "your-rights",
      title: "Your rights",
      body: (
        <>
          <p>Under the DPDP Act you have the right to:</p>
          <ul className={listClass}>
            <li>
              <strong className="font-semibold text-foreground">Access</strong>: a summary of the personal
              data we hold about you, how we use it and who we have shared it with (section 11).
            </li>
            <li>
              <strong className="font-semibold text-foreground">Correction and erasure</strong>: have your
              data corrected, completed or updated, or erased (section 12).
            </li>
            <li>
              <strong className="font-semibold text-foreground">Withdraw consent</strong> at any time (section
              6).
            </li>
            <li>
              <strong className="font-semibold text-foreground">Grievance redressal</strong>: complain to us
              about how we handle your data and receive a response (section 13).
            </li>
            <li>
              <strong className="font-semibold text-foreground">Nominate</strong> someone to exercise these
              rights for you in the event of your death or incapacity (section 14).
            </li>
          </ul>
          <p>
            To use any of these rights, email {emailLink} from the address you used on the enquiry form, so we
            can confirm the request comes from you. We will respond within 30 days. If you are not satisfied
            with our response to a grievance, you can complain to the Data Protection Board of India.
          </p>
        </>
      ),
    },
    {
      id: "children",
      title: "Children",
      body: (
        <p>
          Our enquiry form is intended for adults. If you are booking for someone under 18, a parent or lawful
          guardian should submit the enquiry and give consent on their behalf.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to this notice",
      body: (
        <p>
          If we change how we handle personal data, we will update this notice and the “last updated” date at
          the top of this page.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact and grievances",
      body: (
        <>
          <p>For questions, requests or complaints about your personal data, contact us:</p>
          <ul className={listClass}>
            <li>Email: {emailLink}</li>
            <li>
              Phone:{" "}
              <a href={`tel:${phoneE164}`} className={linkClass}>
                {formatIndianPhone(phoneE164)}
              </a>
            </li>
            <li>Post: {formatAddressLines().join(", ")}</li>
          </ul>
        </>
      ),
    },
  ];

  return (
    <>
      <PageIntro eyebrow="Legal" title={seo.title} subtitle={seo.description}>
        <p className="mt-6 text-sm text-muted">
          Last updated <time dateTime={lastUpdated}>{formatCalendarDate(lastUpdated)}</time>
        </p>
      </PageIntro>

      <Container className="grid gap-12 py-16 lg:grid-cols-12 lg:gap-16 lg:py-24">
        <nav aria-label="On this page" className="lg:col-span-4">
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft lg:sticky lg:top-28">
            <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">On this page</p>
            <ol className="mt-3 text-sm">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="flex min-h-11 items-center text-primary underline-offset-4 hover:underline"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="max-w-2xl space-y-12 lg:col-span-8">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
              className="scroll-mt-6"
            >
              <h2 id={`${section.id}-title`} className="font-display text-2xl tracking-tight text-primary">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-foreground/85">{section.body}</div>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}

const linkClass =
  "font-semibold break-words text-primary underline underline-offset-4 hover:text-primary-hover";
const listClass = "list-disc space-y-2 pl-5 marker:text-primary/50";
