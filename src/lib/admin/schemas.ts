import { z } from "zod";
import { siteConfig } from "@/config/site.config";
import { DEFAULT_SORT, SEARCH_MAX_LENGTH, periodOptions, serviceFilterOptions, sortOptions } from "./filters";

/**
 * Validation for every input the admin area accepts. Shared by the route
 * handlers (the security boundary) and the admin UI (for instant feedback), so
 * both always enforce the same rules.
 *
 * Plain module, no `server-only`: the login form imports `adminLoginSchema`.
 */

/** Upper bound on `page` so a crafted URL can't ask MongoDB to skip an absurd number of documents. */
export const MAX_PAGE = 10_000;

/** Status ids come from the config, so adding a status there is the only change needed. */
export const enquiryStatusSchema = z.enum(
  siteConfig.admin.statuses.map((status) => status.id),
  "Choose a valid status.",
);

const pageSchema = z.coerce
  .number("Page must be a number.")
  .int("Page must be a whole number.")
  .min(1, "Page must be 1 or more.")
  .max(MAX_PAGE, `Page must be ${MAX_PAGE} or less.`);

/** Body of `POST /api/admin/session`. The 256 cap keeps scrypt's input (and its cost) bounded. */
export const adminLoginSchema = z.object({
  password: z
    .string("Enter the admin password.")
    .min(1, "Enter the admin password.")
    .max(256, "Password is too long."),
});

export type AdminLoginInput = z.input<typeof adminLoginSchema>;

/** Free-text search: trimmed and capped; an empty box means "no search". */
const searchSchema = z
  .string("Search must be text.")
  .trim()
  .max(SEARCH_MAX_LENGTH, `Search must be ${SEARCH_MAX_LENGTH} characters or fewer.`)
  .transform((value) => value || undefined);

const serviceSchema = z.enum(
  serviceFilterOptions.map((option) => option.slug),
  "Choose a valid service.",
);

const periodSchema = z.enum(
  periodOptions.map((option) => option.id),
  "Choose a valid period.",
);

const sortSchema = z.enum(
  sortOptions.map((option) => option.id),
  "Choose a valid sort order.",
);

/** Query of `GET /api/admin/enquiries`. Strict: malformed input is a 400, never silently "fixed". */
export const enquiryListQuerySchema = z.object({
  page: pageSchema.default(1),
  status: enquiryStatusSchema.optional(),
  q: searchSchema.optional(),
  service: serviceSchema.optional(),
  period: periodSchema.optional(),
  sort: sortSchema.optional(),
});

/** Body of `PATCH /api/admin/enquiries/[id]`. */
export const enquiryStatusUpdateSchema = z.object({
  status: enquiryStatusSchema,
});

/**
 * Dashboard search params. Unlike the API, these come from an address bar the
 * owner can edit or bookmark, so each field falls back to its default on its
 * own instead of turning a typo into an error page.
 */
const dashboardSearchParamsSchema = z.object({
  page: pageSchema.catch(1),
  status: enquiryStatusSchema.optional().catch(undefined),
  q: searchSchema.optional().catch(undefined),
  service: serviceSchema.optional().catch(undefined),
  period: periodSchema.optional().catch(undefined),
  sort: sortSchema.catch(DEFAULT_SORT),
});

export type DashboardQuery = z.output<typeof dashboardSearchParamsSchema>;

export function parseDashboardSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): DashboardQuery {
  return dashboardSearchParamsSchema.parse(searchParams);
}
