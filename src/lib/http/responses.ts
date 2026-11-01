import "server-only";
import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { logger } from "@/lib/logger";
import { HttpError, type ApiErrorBody, type ApiSuccessBody, type ErrorCode } from "./errors";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccessBody<T>>({ data }, init);
}

export function jsonError(
  status: number,
  code: ErrorCode,
  message: string,
  extra?: Record<string, unknown>,
  headers?: Record<string, string>,
) {
  return NextResponse.json<ApiErrorBody>({ error: { code, message, ...extra } }, { status, headers });
}

/** Flattens a Zod error into `{ field: firstMessage }` for form display. */
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_root";
    fields[key] ??= issue.message;
  }
  return fields;
}

export function validationError(error: ZodError) {
  return jsonError(400, "VALIDATION_ERROR", "Please check the highlighted fields.", {
    fields: zodFieldErrors(error),
  });
}

/**
 * Converts any thrown value into a safe JSON response. Known `HttpError`s are
 * returned as-is; anything else is logged server-side and returned as a
 * generic 500 so stack traces and internals never reach the client.
 */
export function handleRouteError(error: unknown, event: string) {
  if (error instanceof HttpError) {
    return jsonError(error.status, error.code, error.message, error.details, error.headers);
  }
  logger.error(event, { error });
  return jsonError(500, "INTERNAL_ERROR", "Something went wrong. Please try again later.");
}
