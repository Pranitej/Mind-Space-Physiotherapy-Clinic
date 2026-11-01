import type { NextRequest } from "next/server";
import { requireAdminApiSession } from "@/lib/admin/api-auth";
import { enquiryListQuerySchema } from "@/lib/admin/schemas";
import { listEnquiries } from "@/lib/enquiries/enquiry.repository";
import { handleRouteError, jsonOk, validationError } from "@/lib/http/responses";

const QUERY_PARAMS = ["page", "status", "q", "service", "period", "sort"] as const;

/**
 * GET /api/admin/enquiries?page=2&status=new&q=priya&service=sports-injury&period=30d&sort=name-asc
 * One page of enquiries matching the search and filters, newest first unless sorted otherwise.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdminApiSession();

    const { searchParams } = request.nextUrl;
    // `get` takes the first value, so a repeated parameter can't smuggle an array past the schema.
    const parsed = enquiryListQuerySchema.safeParse(
      Object.fromEntries(QUERY_PARAMS.map((name) => [name, searchParams.get(name) ?? undefined])),
    );
    if (!parsed.success) return validationError(parsed.error);

    const { q, ...filters } = parsed.data;
    return jsonOk(await listEnquiries({ ...filters, search: q }));
  } catch (error) {
    return handleRouteError(error, "admin.enquiries_list_failed");
  }
}
