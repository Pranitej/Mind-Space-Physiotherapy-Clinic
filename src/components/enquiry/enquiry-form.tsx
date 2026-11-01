"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CalendarClock,
  Check,
  ChevronDown,
  CircleAlert,
  Clock,
  LoaderCircle,
  Mail,
  MessageSquareText,
  ShieldCheck,
  Stethoscope,
  Sun,
  Sunrise,
  Sunset,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button, buttonArrowClasses } from "@/components/ui/button";
import { enquiryServiceOptions, siteConfig } from "@/config/site.config";
import type { TimeSlotId } from "@/config/types";
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
import {
  ControlIcon,
  Field,
  FieldError,
  OptionalMark,
  RequiredMark,
  controlClasses,
  controlWithIconClasses,
  describedBy,
} from "@/components/ui/form-field";

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

const timeOptions: ReadonlyArray<{ id: TimeSlotId | ""; label: string }> = [
  { id: "", label: "No preference" },
  ...siteConfig.booking.timeSlots,
];

/** "Morning (8 AM – 12 PM)" -> ["Morning", "8 AM – 12 PM"], so a tile can set the hours on their own line. */
function splitSlotLabel(label: string): [name: string, hours: string | undefined] {
  const match = /^(.*?)\s*\((.+)\)$/.exec(label);
  return match ? [match[1], match[2]] : [label, undefined];
}

const slotIcons: Record<TimeSlotId | "", LucideIcon> = {
  "": CalendarClock,
  morning: Sunrise,
  afternoon: Sun,
  evening: Sunset,
};

/** A numbered group of fields. The fields indent under the title from `sm` up. */
function FormSection({
  step,
  title,
  description,
  className,
  children,
}: {
  step: number;
  title: string;
  description: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
        >
          {step}
        </span>
        <div>
          <h3 className="font-sans text-base font-semibold text-foreground">{title}</h3>
          <p className="mt-0.5 text-sm text-muted">{description}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-x-5 gap-y-6 sm:grid-cols-2 sm:pl-10">{children}</div>
    </div>
  );
}

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
      {/*
        Present from first render so the confirmation is announced when it
        appears. Only this short status is live, not the whole card: the card
        holds interactive parts (the copy button) whose own updates would
        otherwise be read out twice.
      */}
      <p className="sr-only" aria-live="polite">
        {reference && `Enquiry sent. Your reference is ${reference}.`}
      </p>
      {reference && <EnquirySuccess reference={reference} />}

      {!reference && (
        <form
          noValidate
          aria-labelledby={ids.title}
          onSubmit={(event) => void handleSubmit(onSubmit, focusFirstError)(event)}
          className="overflow-clip rounded-[2rem] border border-border bg-surface shadow-lift motion-safe:animate-rise motion-safe:[animation-delay:150ms]"
        >
          <div className="flex flex-col gap-4 border-b border-border bg-primary-soft/40 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-8">
            <div>
              <h2 id={ids.title} className="font-display text-2xl tracking-tight text-primary sm:text-3xl">
                Request an appointment
              </h2>
              <p className="mt-1.5 text-sm text-muted">
                Fields marked <RequiredMark /> are required.
              </p>
            </div>
            <p className="inline-flex items-center gap-2 self-start rounded-full bg-surface px-3.5 py-1.5 text-xs font-semibold text-primary shadow-soft ring-1 ring-primary/10 sm:self-auto">
              <Clock aria-hidden="true" className="size-3.5" />
              Takes about a minute
            </p>
          </div>

          <div className="space-y-10 px-6 py-8 sm:px-10 sm:py-10">
            <FormSection
              step={1}
              title="Your details"
              description="So we can reach you to confirm a time."
              className="motion-safe:animate-fade-in motion-safe:[animation-delay:300ms]"
            >
              <Field
                id={ids.name}
                label="Full name"
                required
                error={errors.name?.message}
                className="sm:col-span-2"
              >
                {(aria) => (
                  <div className="relative">
                    <ControlIcon icon={UserRound} />
                    <input
                      id={ids.name}
                      type="text"
                      autoComplete="name"
                      autoCapitalize="words"
                      placeholder="e.g. Priya Sharma"
                      className={cn(controlClasses, controlWithIconClasses)}
                      {...aria}
                      {...register("name")}
                    />
                  </div>
                )}
              </Field>

              <Field id={ids.email} label="Email address" required error={errors.email?.message}>
                {(aria) => (
                  <div className="relative">
                    <ControlIcon icon={Mail} />
                    <input
                      id={ids.email}
                      type="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder="name@example.com"
                      className={cn(controlClasses, controlWithIconClasses)}
                      {...aria}
                      {...register("email")}
                    />
                  </div>
                )}
              </Field>

              <Field id={ids.phone} label="Mobile number" required error={errors.phone?.message}>
                {(aria) => (
                  <div className="relative">
                    {/* Visual only: the schema accepts the number with or without +91. */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 left-0 flex items-center border-r border-border pr-3 pl-4 text-base font-medium text-muted transition-colors duration-300 group-focus-within/field:text-primary"
                    >
                      +91
                    </span>
                    <input
                      id={ids.phone}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      placeholder="98765 43210"
                      className={cn(controlClasses, "pl-17")}
                      {...aria}
                      {...register("phone")}
                    />
                  </div>
                )}
              </Field>
            </FormSection>

            <FormSection
              step={2}
              title="Your appointment"
              description="Pick a service. A date and time help us, but are up to you."
              className="motion-safe:animate-fade-in motion-safe:[animation-delay:400ms]"
            >
              <Field
                id={ids.service}
                label="Service"
                required
                hint="Not sure? Choose the assessment option."
                error={errors.service?.message}
              >
                {(aria) => (
                  <div className="relative">
                    <ControlIcon icon={Stethoscope} />
                    <select
                      id={ids.service}
                      className={cn(
                        controlClasses,
                        controlWithIconClasses,
                        "cursor-pointer appearance-none pr-11",
                      )}
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
                      className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-muted transition-colors duration-300 group-focus-within/field:text-primary"
                    />
                  </div>
                )}
              </Field>

              <Field
                id={ids.preferredDate}
                label="Preferred date"
                optional
                hint={`Between ${formatCalendarDate(minDate)} and ${formatCalendarDate(maxDate)}.`}
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
                className="sm:col-span-2"
              >
                <legend className="p-0 text-sm font-semibold text-foreground">
                  Preferred time
                  <OptionalMark />
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {timeOptions.map((option) => {
                    const [name, hours] = splitSlotLabel(option.label);
                    const SlotIcon = slotIcons[option.id];
                    return (
                      <label
                        key={option.id || "none"}
                        className={cn(
                          "group/slot relative flex cursor-pointer flex-col gap-4 rounded-2xl border border-border",
                          "bg-background/60 p-4 transition-[border-color,background-color,box-shadow] duration-300 ease-smooth",
                          "hover:border-primary/35 has-checked:border-primary has-checked:bg-primary-soft/50",
                          "has-checked:shadow-soft has-focus-visible:border-primary has-focus-visible:ring-4",
                          "has-focus-visible:ring-primary/10",
                        )}
                      >
                        <input
                          type="radio"
                          value={option.id}
                          className="sr-only"
                          {...register("preferredTime")}
                        />
                        <span className="flex items-center justify-between">
                          <SlotIcon
                            aria-hidden="true"
                            className="size-5 text-muted transition-colors duration-300 group-has-checked/slot:text-primary"
                          />
                          <span
                            aria-hidden="true"
                            className={cn(
                              "grid size-5 place-items-center rounded-full border border-border bg-surface",
                              "transition-colors duration-300 group-has-checked/slot:border-primary",
                              "group-has-checked/slot:bg-primary",
                            )}
                          >
                            <Check
                              strokeWidth={3}
                              className={cn(
                                "size-3 scale-50 text-primary-foreground opacity-0 transition-[opacity,scale]",
                                "duration-300 ease-out-soft group-has-checked/slot:scale-100",
                                "group-has-checked/slot:opacity-100",
                              )}
                            />
                          </span>
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-foreground">{name}</span>
                          <span className="mt-0.5 block text-xs text-muted">{hours ?? "Any time"}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-2">
                  <FieldError id={`${ids.preferredTime}-error`} message={errors.preferredTime?.message} />
                </div>
              </fieldset>
            </FormSection>

            <FormSection
              step={3}
              title="Anything else?"
              description="Briefly describe the problem, how long you have had it and any recent surgery."
              className="motion-safe:animate-fade-in motion-safe:[animation-delay:500ms]"
            >
              <Field
                id={ids.message}
                label="Message"
                optional
                error={errors.message?.message}
                extraDescribedBy={ids.messageCount}
                className="sm:col-span-2"
              >
                {(aria) => (
                  <>
                    <div className="relative">
                      <ControlIcon icon={MessageSquareText} align="top" />
                      <textarea
                        id={ids.message}
                        rows={4}
                        placeholder="For example: lower back pain for three weeks, worse when sitting."
                        className={cn(
                          controlClasses,
                          controlWithIconClasses,
                          "min-h-28 resize-y py-3 leading-relaxed",
                        )}
                        {...aria}
                        {...register("message")}
                      />
                    </div>
                    <div className="flex justify-end">
                      <CharacterCount id={ids.messageCount} length={message.length} max={messageMaxLength} />
                    </div>
                  </>
                )}
              </Field>
            </FormSection>
          </div>

          {/*
            Honeypot. Moved off-screen rather than display:none, which many bots
            detect and skip. Hidden from assistive technology and the tab order.
          */}
          <div aria-hidden="true" className="absolute left-[-9999px] size-px overflow-hidden">
            <label htmlFor={ids.website}>Website</label>
            <input id={ids.website} type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
          </div>

          <div className="border-t border-border bg-background/50 px-6 py-6 motion-safe:animate-fade-in motion-safe:[animation-delay:600ms] sm:px-10 sm:py-8">
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
              <label htmlFor={ids.consent} className="cursor-pointer text-sm leading-relaxed text-foreground">
                I agree to {siteConfig.name} storing my details and contacting me by phone or email about this
                enquiry, as described in the{" "}
                <Link
                  href="/privacy"
                  className="font-semibold text-primary underline underline-offset-4 hover:no-underline"
                >
                  privacy policy
                </Link>
                .<RequiredMark />
              </label>
            </div>
            <div className="mt-2 pl-8">
              <FieldError id={`${ids.consent}-error`} message={errors.consent?.message} />
            </div>

            {submitError && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger motion-safe:animate-drop-in"
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

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="order-last flex items-center gap-2 text-sm text-muted sm:order-first">
                <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-success" />
                We&apos;ll call you back {siteConfig.booking.responseTimeLabel}.
              </p>
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
                  <>
                    Send enquiry
                    <ArrowRight aria-hidden="true" className={buttonArrowClasses} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
