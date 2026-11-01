import type { Document, Filter } from "mongodb";
import {
  DEFAULT_SORT,
  getReceivedSince,
  type EnquiryListFilters,
  type EnquirySort,
} from "@/lib/admin/filters";
import { escapeRegExp } from "@/lib/utils";
import type { EnquiryDocument } from "./enquiry.types";

/**
 * Pure builders for the admin list query, kept apart from the repository so
 * they can be unit-tested without a database.
 */

/** Phone search needs at least this many digits, so "a1" doesn't match every number containing a 1. */
const MIN_PHONE_DIGITS = 3;

/**
 * MongoDB filter for the admin list. Search text is regex-escaped, so it is
 * always matched literally: it can't inject query operators or a costly
 * pattern. An unanchored, case-insensitive regex can't use an index, which is
 * fine at a clinic's volume (and retention caps the collection size).
 */
export function buildEnquiryFilter(
  { status, search, service, period }: EnquiryListFilters,
  now: Date = new Date(),
): Filter<EnquiryDocument> {
  const filter: Filter<EnquiryDocument> = {};
  if (status) filter.status = status;
  if (service) filter.service = service;

  const since = getReceivedSince(period, now);
  if (since) filter.createdAt = { $gte: since };

  const term = search?.trim();
  if (term) {
    const pattern = new RegExp(escapeRegExp(term), "i");
    const clauses: Filter<EnquiryDocument>[] = [
      { name: pattern },
      { email: pattern },
      { reference: pattern },
      { message: pattern },
    ];
    // Phones are stored as E.164 ("+919876543210"), so compare digits only:
    // "98765 43210" and "+91 98765" both match.
    const digits = term.replace(/\D/g, "");
    if (digits.length >= MIN_PHONE_DIGITS) clauses.push({ phone: new RegExp(digits) });
    filter.$or = clauses;
  }

  return filter;
}

/** Field added for the "preferred date" sort so enquiries without a date sort last. */
export const NO_PREFERRED_DATE_FIELD = "noPreferredDate";

/** Sort stage per option. Ties fall back to newest first, so paging is stable. */
const sortStages: Record<EnquirySort, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  "name-asc": { name: 1, createdAt: -1 },
  "name-desc": { name: -1, createdAt: -1 },
  "preferred-date": { [NO_PREFERRED_DATE_FIELD]: 1, preferredDate: 1, createdAt: -1 },
  updated: { updatedAt: -1, createdAt: -1 },
};

/** Pipeline stages that order the matched enquiries. */
export function buildSortStages(sort: EnquirySort = DEFAULT_SORT): Document[] {
  const stages: Document[] = [];
  if (sort === "preferred-date") {
    stages.push({
      $addFields: { [NO_PREFERRED_DATE_FIELD]: { $eq: [{ $ifNull: ["$preferredDate", null] }, null] } },
    });
  }
  stages.push({ $sort: sortStages[sort] });
  return stages;
}

/** Name sorts compare case-insensitively ("anil" sorts with "Anil", not after "Zara"). */
export function isNameSort(sort: EnquirySort | undefined): boolean {
  return sort === "name-asc" || sort === "name-desc";
}
