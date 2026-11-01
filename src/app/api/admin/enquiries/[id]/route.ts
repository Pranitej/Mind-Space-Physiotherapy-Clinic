import type { NextRequest } from "next/server";
import { siteConfig } from "@/config/site.config";
import { requireAdminApiSession } from "@/lib/admin/api-auth";
import { enquiryStatusUpdateSchema } from "@/lib/admin/schemas";
import { isValidEnquiryId, updateEnquiryStatus } from "@/lib/enquiries/enquiry.repository";
import { handleRouteError, jsonError, jsonOk, validationError } from "@/lib/http/responses";
import { logger } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { assertSameOrigin, getClientIp, hashIp, readJsonBody } from "@/lib/security/request";

function enquiryNotFound() {
  return jsonError(404, "NOT_FOUND", "Enquiry not found.");
}

/** PATCH /api/admin/enquiries/:id with `{ "status": "contacted" }`. Responds with the updated enquiry. */
export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/enquiries/[id]">) {
  try {
    assertSameOrigin(request);
    await requireAdminApiSession();
    await enforceRateLimit(
      "admin-mutation",
      hashIp(getClientIp(request)),
      siteConfig.security.rateLimits.adminMutation,
    );

    const parsed = enquiryStatusUpdateSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) return validationError(parsed.error);

    const { id } = await ctx.params;
    // A malformed id can't match any enquiry: answer 404 without a database round trip.
    if (!isValidEnquiryId(id)) return enquiryNotFound();

    const enquiry = await updateEnquiryStatus(id, parsed.data.status);
    if (!enquiry) return enquiryNotFound();

    logger.info("admin.enquiry_status_updated", { reference: enquiry.reference, status: enquiry.status });
    return jsonOk(enquiry);
  } catch (error) {
    return handleRouteError(error, "admin.enquiry_status_update_failed");
  }
}
