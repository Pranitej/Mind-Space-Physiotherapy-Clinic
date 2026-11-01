import type { NextRequest } from "next/server";
import { requireAdminApiSession } from "@/lib/admin/api-auth";
import { enquiryListQuerySchema } from "@/lib/admin/schemas";
import { listEnquiries } from "@/lib/enquiries/enquiry.repository";
import { handleRouteError, jsonOk, validationError } from "@/lib/http/responses";

/** GET /api/admin/enquiries?page=2&status=new: one page of enquiries, newest first. */
export async function GET(request: NextRequest) {
  try {
    await requireAdminApiSession();

    const { searchParams } = request.nextUrl;
    // `get` takes the first value, so a repeated parameter can't smuggle an array past the schema.
    const parsed = enquiryListQuerySchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });
    if (!parsed.success) return validationError(parsed.error);

    return jsonOk(await listEnquiries(parsed.data));
  } catch (error) {
    return handleRouteError(error, "admin.enquiries_list_failed");
  }
}
