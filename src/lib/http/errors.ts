/**
 * Typed HTTP errors thrown from route-handler helpers and mapped to a
 * consistent JSON error envelope by `handleRouteError`.
 */
export type ErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    readonly details?: Record<string, unknown>,
    readonly headers?: Record<string, string>,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/** Shape of every error response body returned by the API. */
export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    /** Field-level validation messages, keyed by field name. */
    fields?: Record<string, string>;
    [key: string]: unknown;
  };
}

/** Shape of every success response body returned by the API. */
export interface ApiSuccessBody<T> {
  data: T;
}
