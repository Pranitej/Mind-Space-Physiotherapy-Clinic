"use client";

import { CircleCheck } from "lucide-react";
import { useEffect, useRef } from "react";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site.config";

/** Replaces the form once the enquiry is saved. */
export function EnquirySuccess({ reference }: { reference: string }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { successTitle, successMessage } = siteConfig.pages.contact;
  const { phone, phoneE164 } = siteConfig.contact;

  // The form the user was interacting with has just disappeared; move focus to
  // the confirmation so keyboard and screen-reader users are not left stranded.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 text-center shadow-sm sm:p-10">
      <CircleCheck aria-hidden="true" className="mx-auto size-12 text-success" strokeWidth={1.75} />
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-4 font-display text-2xl text-primary focus:outline-none sm:text-3xl"
      >
        {successTitle}
      </h2>
      <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted">{successMessage}</p>

      <div className="mx-auto mt-6 max-w-xs rounded-2xl bg-primary-soft px-6 py-4">
        <p className="text-sm text-muted">Your reference</p>
        <p className="mt-1 font-mono text-xl font-semibold tracking-wider text-primary">{reference}</p>
      </div>

      <p className="mt-6 text-sm text-muted">
        Need to speak to us sooner? Call{" "}
        <a
          href={`tel:${phoneE164}`}
          className="font-semibold whitespace-nowrap text-primary underline underline-offset-4 hover:no-underline"
        >
          {phone}
        </a>{" "}
        and quote your reference.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/" variant="outline">
          Back to home
        </ButtonLink>
        <ButtonLink href="/services" variant="ghost">
          Explore our services
        </ButtonLink>
      </div>
    </div>
  );
}
