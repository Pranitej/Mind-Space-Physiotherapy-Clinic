import "server-only";
import { randomInt } from "node:crypto";
import { MongoServerError, ObjectId, type Collection, type Filter } from "mongodb";
import { siteConfig } from "@/config/site.config";
import { collections, getDb } from "@/lib/db/mongodb";
import type {
  EnquiryDocument,
  EnquiryDto,
  EnquiryPage,
  EnquiryStatus,
  EnquiryStatusCounts,
  NewEnquiry,
  NotificationChannel,
  NotificationStatus,
} from "./enquiry.types";

/**
 * Data access for enquiries. The only module that talks to the `enquiries`
 * collection, so query shapes and indexes are defined in one place.
 */

/** Average Gregorian month, so "12 months" means a year rather than 360 days. */
const RETENTION_MS = Math.round(siteConfig.privacy.enquiryRetentionMonths * 30.436875 * 24 * 60 * 60 * 1000);

/** Status that marks the person as a patient; their record is exempt from retention deletion. */
const RETAINED_STATUS: EnquiryStatus = "booked";

let indexesReady: Promise<unknown> | undefined;

async function getCollection(): Promise<Collection<EnquiryDocument>> {
  const db = await getDb();
  const collection = db.collection<EnquiryDocument>(collections.enquiries);
  // createIndexes is idempotent; run it once per runtime instance.
  indexesReady ??= collection
    .createIndexes([
      { key: { createdAt: -1 }, name: "createdAt_desc" },
      { key: { status: 1, createdAt: -1 }, name: "status_createdAt" },
      { key: { reference: 1 }, name: "reference_unique", unique: true },
      // Privacy retention: MongoDB deletes each enquiry once `retainUntil` passes.
      // Documents without the field (booked patients) are never expired.
      { key: { retainUntil: 1 }, name: "retention_ttl", expireAfterSeconds: 0 },
    ])
    .catch((error: unknown) => {
      indexesReady = undefined;
      throw error;
    });
  await indexesReady;
  return collection;
}

// Crockford-style alphabet: no 0/O or 1/I/L, so references are easy to read out on the phone.
const REFERENCE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

/** e.g. "MS-261101-7K3QX" — date prefix (IST) + 5 random characters. */
export function generateReference(now: Date = new Date()): string {
  const datePart = new Intl.DateTimeFormat("en-CA", {
    timeZone: siteConfig.locale.timeZone,
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .replaceAll("-", "");
  const randomPart = Array.from(
    { length: 5 },
    () => REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)],
  ).join("");
  return `MS-${datePart}-${randomPart}`;
}

export function toEnquiryDto(doc: EnquiryDocument): EnquiryDto {
  return {
    id: doc._id.toHexString(),
    reference: doc.reference,
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    service: doc.service,
    preferredDate: doc.preferredDate,
    preferredTime: doc.preferredTime,
    message: doc.message,
    status: doc.status,
    notifications: doc.notifications,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function insertEnquiry(input: NewEnquiry): Promise<EnquiryDocument> {
  const collection = await getCollection();

  // Retry on the (astronomically unlikely) reference collision.
  for (let attempt = 0; attempt < 3; attempt++) {
    const now = new Date();
    const doc: EnquiryDocument = {
      _id: new ObjectId(),
      reference: generateReference(now),
      ...input,
      status: "new",
      notifications: { patient: "pending", clinic: "pending" },
      retainUntil: new Date(now.getTime() + RETENTION_MS),
      createdAt: now,
      updatedAt: now,
    };
    try {
      await collection.insertOne(doc);
      return doc;
    } catch (error) {
      const isDuplicateReference = error instanceof MongoServerError && error.code === 11000;
      if (!isDuplicateReference) throw error;
    }
  }
  throw new Error("Could not allocate a unique enquiry reference");
}

export async function setNotificationStatus(
  id: ObjectId,
  channel: NotificationChannel,
  status: NotificationStatus,
): Promise<void> {
  const collection = await getCollection();
  await collection.updateOne({ _id: id }, { $set: { [`notifications.${channel}`]: status } });
}

export async function listEnquiries({
  page = 1,
  pageSize = siteConfig.admin.pageSize,
  status,
}: {
  page?: number;
  pageSize?: number;
  status?: EnquiryStatus;
} = {}): Promise<EnquiryPage> {
  const collection = await getCollection();
  const filter: Filter<EnquiryDocument> = status ? { status } : {};
  const safePage = Math.max(1, Math.floor(page));

  const [total, docs] = await Promise.all([
    collection.countDocuments(filter),
    collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
  ]);

  return {
    items: docs.map(toEnquiryDto),
    total,
    page: safePage,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function countEnquiriesByStatus(): Promise<EnquiryStatusCounts> {
  const collection = await getCollection();
  const rows = await collection
    .aggregate<{ _id: EnquiryStatus; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }])
    .toArray();

  const counts = Object.fromEntries(siteConfig.admin.statuses.map((s) => [s.id, 0])) as Record<
    EnquiryStatus,
    number
  >;
  for (const row of rows) counts[row._id] = row.count;
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  return { ...counts, total };
}

/** Strict 24-hex check (ObjectId.isValid also accepts any 12-character string). */
export function isValidEnquiryId(id: string): boolean {
  return /^[a-f0-9]{24}$/i.test(id);
}

/** Returns the updated enquiry, or null if no enquiry has that id. */
export async function updateEnquiryStatus(id: string, status: EnquiryStatus): Promise<EnquiryDto | null> {
  if (!isValidEnquiryId(id)) return null;
  const collection = await getCollection();
  // Pipeline update so the retention deadline can be derived from the stored
  // createdAt: removed when the person books, restored if that is undone.
  const retainUntil = status === RETAINED_STATUS ? "$$REMOVE" : { $add: ["$createdAt", RETENTION_MS] };
  const doc = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    [{ $set: { status, updatedAt: new Date(), retainUntil } }],
    { returnDocument: "after" },
  );
  return doc ? toEnquiryDto(doc) : null;
}
