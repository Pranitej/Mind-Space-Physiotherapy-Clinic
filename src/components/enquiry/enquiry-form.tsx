"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, CircleAlert, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { enquiryServiceOptions, siteConfig } from "@/config/site.config";
import {
  enquiryFieldNames,
  enquiryFormSchema,
  type EnquiryCreatedResponse,
  type EnquiryFormInput,
  type EnquiryFormValues,
} from "@/lib/enquiries/enquiry.schema";
import { formatCalendarDate } from "@/lib/format";
import type { ApiErrorBody, ApiSuccessBody } from "@/lib/http/errors";
import { cn } from "@/lib/utils";
import { CharacterCount } from "./character-count";
import { EnquirySuccess } from "./enquiry-success";
import { Field, FieldError, RequiredMark, controlClasses, describedBy } from "./form-field";

interface EnquiryFormProps {
  /** Service slug to preselect (already validated by the page). */
  defaultService?: string;
  /** Selectable date range as "YYYY-MM-DD", computed on the server so SSR and hydration agree. */
  minDate: string;
  maxDate: string;
}

type SubmitError =
  | { kind: "validation" }
  | { kind: "rate-limited"; retryAfterSeconds: number | null }
  | { kind: "unexpected" };

const ids = {
  name: "enquiry-name",
  email: "enquiry-email",
  phone: "enquiry-phone",
  service: "enquiry-service",
  preferredDate: "enquiry-date",
  preferredTime: "enquiry-time",
  message: "enquiry-message",
  messageCount: "enquiry-message-count",
  consent: "enquiry-consent",
  website: "enquiry-website",
  title: "enquiry-form-title",
} as const;

const timeOptions = [{ id: "", label: "No preference" }, ...siteConfig.booking.timeSlots];

function isApiError(body: unknown): body is ApiErrorBody {
  if (typeof body !== "object" || body === null || !("error" in body)) return false;
  const { error } = body as { error: unknown };
  return (
    typeof error === "object" && error !== null && typeof (error as { code?: unknown }).code === "string"
  );
}

function isCreated(body: unknown): body is ApiSuccessBody<EnquiryCreatedResponse> {
  if (typeof body !== "object" || body === null || !("data" in body)) return false;
  const { data } = body as { data: unknown };
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as { reference?: unknown }).reference === "string"
  );
}

function readRetryAfterSeconds(response: Response, body: unknown): number | null {
  const fromBody = isApiError(body) ? body.error.retryAfterSeconds : undefined;
  const seconds = typeof fromBody === "number" ? fromBody : Number(response.headers.get("Retry-After"));
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

function describeWait(seconds: number | null): string {
  if (!seconds) return "a little while";
  const minutes = Math.ceil(seconds / 60);
  return minutes <= 1 ? "a minute" : `${minutes} minutes`;
}

export function EnquiryForm({ defaultService, minDate, maxDate }: EnquiryFormProps) {
  const [reference, setReference] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);
  const [pending, setPending] = useState(false);
  // State only updates after a render; the ref also blocks a second submit fired in the same tick.
  const inFlight = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<EnquiryFormInput, unknown, EnquiryFormValues>({
    resolver: zodResolver(enquiryFormSchema),
    mode: "onTouched",
    // Built-in focusing follows field registration order, which put focus on the
    // last field; focusFirstError uses the visual (schema) order instead.
    shouldFocusError: false,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      service: defaultService ?? "",
      preferredDate: "",
      preferredTime: "",
      message: "",
      consent: false,
      website: "",
    },
  });

  const message = useWatch({ control, name: "message" }) ?? "";
  const { messageMaxLength } = siteConfig.booking;
  const { phone, phoneE164 } = siteConfig.contact;

  function focusFirstError(fieldErrors: Partial<Record<string, unknown>>) {
    const first = enquiryFieldNames.find((name) => name !== "website" && fieldErrors[name]);
    if (first) setFocus(first);
  }

  function applyServerFieldErrors(fields: Record<string, string>): boolean {
    const invalid = enquiryFieldNames.filter((name) => name !== "website" && fields[name]);
    for (const name of invalid) setError(name, { type: "server", message: fields[name] });
    if (invalid[0]) setFocus(invalid[0]);
    return invalid.length > 0;
  }

  async function onSubmit(values: EnquiryFormValues) {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(values),
      });
      const body: unknown = await response.json().catch(() => null);

      if (response.status === 201 && isCreated(body)) {
        setReference(body.data.reference);
      } else if (response.status === 400 && isApiError(body) && body.error.fields) {
        setSubmitError(
          applyServerFieldErrors(body.error.fields) ? { kind: "validation" } : { kind: "unexpected" },
        );
      } else if (response.status === 429) {
        setSubmitError({ kind: "rate-limited", retryAfterSeconds: readRetryAfterSeconds(response, body) });
      } else {
        setSubmitError({ kind: "unexpected" });
      }
    } catch {
      // Network failure, offline, or a non-JSON response from an intermediary.
      setSubmitError({ kind: "unexpected" });
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  const callUs = (
    <a
      href={`tel:${phoneE164}`}
      className="font-semibold whitespace-nowrap underline underline-offset-4 hover:no-underline"
    >
      {phone}
    </a>
  );

  return (
    <div>
      {/* Present from first render so the confirmation is announced when it appears. */}
      <div aria-live="polite">{reference && <EnquirySuccess reference={reference} />}</div>

      {!reference && (
        <form
          noValidate
          aria-labelledby={ids.title}
          onSubmit={(event) => void handleSubmit(onSubmit, focusFirstError)(event)}
          className="rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-8"
        >
          <h2 id={ids.title} className="font-display text-2xl text-primary sm:text-3xl">
            Request an appointment
          </h2>
          <p className="mt-2 text-sm text-muted">
            Fields marked <RequiredMark /> are required. It takes about a minute.
          </p>

          <div className="mt-6 grid gap-x-5 gap-y-6 sm:grid-cols-2">
            <Field id={ids.name} label="Full name" required error={errors.name?.message}>
              {(aria) => (
                <input
                  id={ids.name}
                  type="text"
                  autoComplete="name"
                  autoCapitalize="words"
                  className={controlClasses}
                  {...aria}
                  {...register("name")}
                />
              )}
            </Field>

            <Field id={ids.email} label="Email address" required error={errors.email?.message}>
              {(aria) => (
                <input
                  id={ids.email}
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="name@example.com"
                  className={controlClasses}
                  {...aria}
                  {...register("email")}
                />
              )}
            </Field>

            <Field
              id={ids.phone}
              label="Mobile number"
              required
              hint="Indian mobile number, e.g. 98765 43210"
              error={errors.phone?.message}
            >
              {(aria) => (
                <input
                  id={ids.phone}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className={controlClasses}
                  {...aria}
                  {...register("phone")}
                />
              )}
            </Field>

            <Field
              id={ids.service}
              label="Service"
              required
              hint="Not sure? Choose the assessment option."
              error={errors.service?.message}
            >
              {(aria) => (
                <div className="relative">
                  <select
                    id={ids.service}
                    className={cn(controlClasses, "cursor-pointer appearance-none pr-11")}
                    {...aria}
                    {...register("service")}
                  >
                    <option value="">Select a service</option>
                    {enquiryServiceOptions.map((option) => (
                      <option key={option.slug} value={option.slug}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-muted"
                  />
                </div>
              )}
            </Field>

            <Field
              id={ids.preferredDate}
              label="Preferred date"
              hint={`Optional. Between ${formatCalendarDate(minDate)} and ${formatCalendarDate(maxDate)}.`}
              error={errors.preferredDate?.message}
            >
              {(aria) => (
                <input
                  id={ids.preferredDate}
                  type="date"
                  min={minDate}
                  max={maxDate}
                  className={cn(controlClasses, "appearance-none")}
                  {...aria}
                  {...register("preferredDate")}
                />
              )}
            </Field>

            <fieldset
              aria-describedby={describedBy(errors.preferredTime && `${ids.preferredTime}-error`)}
              className="flex flex-col gap-2"
            >
              <legend className="mb-2 text-sm font-semibold text-foreground">Preferred time</legend>
              <div className="grid grid-cols-2 gap-2">
                {timeOptions.map((option) => (
                  <label
                    key={option.id || "none"}
                    className={cn(
                      "flex min-h-12 cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-surface",
                      "px-3 py-2 text-sm leading-snug transition-colors duration-200 hover:border-primary/40",
                      "has-checked:border-primary has-checked:bg-primary-soft has-checked:font-medium",
                    )}
                  >
                    <input
                      type="radio"
                      value={option.id}
                      className="size-4 shrink-0 accent-primary"
                      {...register("preferredTime")}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              <FieldError id={`${ids.preferredTime}-error`} message={errors.preferredTime?.message} />
            </fieldset>

            <Field
              id={ids.message}
              label="How can we help?"
              hint="Optional. Briefly describe the problem, how long you have had it and any recent surgery."
              error={errors.message?.message}
              extraDescribedBy={ids.messageCount}
              className="sm:col-span-2"
            >
              {(aria) => (
                <>
                  <textarea
                    id={ids.message}
                    rows={5}
                    className={cn(controlClasses, "min-h-32 resize-y py-3 leading-relaxed")}
                    {...aria}
                    {...register("message")}
                  />
                  <CharacterCount id={ids.messageCount} length={message.length} max={messageMaxLength} />
                </>
              )}
            </Field>

            <div className="sm:col-span-2">
              <div className="flex items-start gap-3">
                <input
                  id={ids.consent}
                  type="checkbox"
                  aria-invalid={errors.consent ? true : undefined}
                  aria-required
                  aria-describedby={describedBy(errors.consent && `${ids.consent}-error`)}
                  className="mt-0.5 size-5 shrink-0 cursor-pointer accent-primary"
                  {...register("consent")}
                />
                <label
                  htmlFor={ids.consent}
                  className="cursor-pointer text-sm leading-relaxed text-foreground"
                >
                  I agree to {siteConfig.name} storing my details and contacting me by phone or email about
                  this enquiry, as described in the{" "}
                  <Link
                    href="/privacy"
                    className="font-semibold text-primary underline underline-offset-4 hover:no-underline"
                  >
                    privacy policy
                  </Link>
                  .<RequiredMark />
                </label>
              </div>
              <div className="mt-2">
                <FieldError id={`${ids.consent}-error`} message={errors.consent?.message} />
              </div>
            </div>
          </div>

          {/*
            Honeypot. Moved off-screen rather than display:none, which many bots
            detect and skip. Hidden from assistive technology and the tab order.
          */}
          <div aria-hidden="true" className="absolute left-[-9999px] size-px overflow-hidden">
            <label htmlFor={ids.website}>Website</label>
            <input id={ids.website} type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
          </div>

          {submitError && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger"
            >
              <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <p className="leading-relaxed">
                {submitError.kind === "validation" && "Please check the highlighted fields and try again."}
                {submitError.kind === "rate-limited" && (
                  <>
                    You have sent several enquiries in a short time. Please try again in{" "}
                    {describeWait(submitError.retryAfterSeconds)}, or call us on {callUs}.
                  </>
                )}
                {submitError.kind === "unexpected" && (
                  <>
                    Sorry, we couldn&apos;t send your enquiry just now. Please try again, or call us on{" "}
                    {callUs}.
                  </>
                )}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* aria-disabled rather than disabled: a disabled button drops keyboard focus mid-submit. */}
            <Button
              type="submit"
              size="lg"
              aria-disabled={pending || undefined}
              className="w-full aria-disabled:cursor-progress aria-disabled:opacity-80 sm:w-auto"
            >
              {pending ? (
                <>
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-5 animate-spin motion-reduce:animate-none"
                  />
                  Sending…
                </>
              ) : (
                "Send enquiry"
              )}
            </Button>
            <p className="text-sm text-muted">
              We&apos;ll call you back {siteConfig.booking.responseTimeLabel}.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
