import type { EnquiryDto, EnquiryStatus } from "@/lib/enquiries/enquiry.types";
import type { ApiErrorBody } from "@/lib/http/errors";

/**
 * Browser-side client for the admin API. Every call resolves (never throws) to
 * a discriminated result, so components handle each outcome explicitly
 * instead of wrapping fetch in try/catch.
 */

/** Status used when the request never got a response (offline, DNS, CORS, aborted). */
export const NETWORK_ERROR_STATUS = 0;

export type ApiError = ApiErrorBody["error"];

export type ApiResult<T> =
  { ok: true; status: number; data: T } | { ok: false; status: number; error: ApiError | null };

export type ApiFailure = Extract<ApiResult<unknown>, { ok: false }>;

type Method = "POST" | "PATCH" | "DELETE";

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== "object" || value === null || !("error" in value)) return false;
  const { error } = value;
  return typeof error === "object" && error !== null && "code" in error && "message" in error;
}

async function request<T>(path: string, method: Method, body?: unknown): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(path, {
      method,
      // The API rejects anything that isn't application/json, which is also what makes
      // a cross-site form post impossible without a CORS preflight.
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: NETWORK_ERROR_STATUS, error: null };
  }

  const payload: unknown = response.status === 204 ? null : await response.json().catch(() => null);

  if (response.ok) {
    const data =
      payload !== null && typeof payload === "object" && "data" in payload ? payload.data : undefined;
    return { ok: true, status: response.status, data: data as T };
  }
  return { ok: false, status: response.status, error: isApiErrorBody(payload) ? payload.error : null };
}

export const adminApi = {
  signIn: (password: string) => request<void>("/api/admin/session", "POST", { password }),
  signOut: () => request<void>("/api/admin/session", "DELETE"),
  updateEnquiryStatus: (id: string, status: EnquiryStatus) =>
    request<EnquiryDto>(`/api/admin/enquiries/${encodeURIComponent(id)}`, "PATCH", { status }),
};

/** "1 minute" / "15 minutes", rounded up so we never tell someone to retry too early. */
export function formatRetryAfter(seconds: number): string {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
}

function retryAfterSeconds(error: ApiError | null): number | null {
  const value = error?.retryAfterSeconds;
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

const NETWORK_MESSAGE = "We couldn't reach the server. Check your connection and try again.";
const GENERIC_MESSAGE = "Something went wrong. Please try again.";

export function describeLoginFailure({ status, error }: ApiFailure): string {
  switch (status) {
    case NETWORK_ERROR_STATUS:
      return NETWORK_MESSAGE;
    case 400:
      return error?.fields?.password ?? "Enter the admin password.";
    case 401:
      return "Incorrect password.";
    case 429: {
      const wait = retryAfterSeconds(error);
      return wait
        ? `Too many attempts. Try again in ${formatRetryAfter(wait)}.`
        : "Too many attempts. Try again later.";
    }
    default:
      return GENERIC_MESSAGE;
  }
}

/** 401 is not described here: the caller sends the user back to the login page instead. */
export function describeStatusUpdateFailure({ status }: ApiFailure): string {
  switch (status) {
    case NETWORK_ERROR_STATUS:
      return "Not saved: check your connection and try again.";
    case 404:
      return "Not saved: this enquiry no longer exists. Refresh the page.";
    case 429:
      return "Not saved: too many changes at once. Wait a moment and try again.";
    default:
      return "Not saved. Please try again.";
  }
}
