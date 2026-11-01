import "server-only";
import type { Collection } from "mongodb";
import type { RateLimitRule } from "@/config/types";
import { collections, getDb } from "@/lib/db/mongodb";
import { HttpError } from "@/lib/http/errors";

/**
 * Fixed-window rate limiter backed by MongoDB.
 *
 * Why MongoDB and not an in-memory Map: on Vercel every request may hit a
 * different serverless instance, so in-process counters are not shared and
 * would be trivially bypassed. MongoDB is already part of the stack, so this
 * needs no extra service. A TTL index removes expired windows automatically.
 *
 * The increment is a single atomic `findOneAndUpdate` with an aggregation
 * pipeline, so concurrent requests cannot race past the limit.
 */
interface RateLimitDocument {
  _id: string;
  count: number;
  expiresAt: Date;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

let indexesReady: Promise<unknown> | undefined;

async function getCollection(): Promise<Collection<RateLimitDocument>> {
  const db = await getDb();
  const collection = db.collection<RateLimitDocument>(collections.rateLimits);
  indexesReady ??= collection
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "ttl_expiresAt" })
    .catch((error: unknown) => {
      indexesReady = undefined;
      throw error;
    });
  await indexesReady;
  return collection;
}

export async function consumeRateLimit(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
  const collection = await getCollection();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + rule.windowSeconds * 1000);
  const windowActive = { $gt: ["$expiresAt", now] };

  const doc = await collection.findOneAndUpdate(
    { _id: key },
    [
      {
        $set: {
          count: { $cond: [windowActive, { $add: ["$count", 1] }, 1] },
          expiresAt: { $cond: [windowActive, "$expiresAt", windowEnd] },
        },
      },
    ],
    { upsert: true, returnDocument: "after" },
  );

  const count = doc?.count ?? 1;
  const expiresAt = doc?.expiresAt ?? windowEnd;
  return {
    allowed: count <= rule.limit,
    limit: rule.limit,
    remaining: Math.max(0, rule.limit - count),
    retryAfterSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - now.getTime()) / 1000)),
  };
}

/** Consumes one unit and throws a 429 `HttpError` when the limit is exceeded. */
export async function enforceRateLimit(
  scope: string,
  identifier: string,
  rule: RateLimitRule,
): Promise<void> {
  const result = await consumeRateLimit(`${scope}:${identifier}`, rule);
  if (!result.allowed) {
    throw new HttpError(
      429,
      "RATE_LIMITED",
      "Too many requests. Please wait a while and try again.",
      { retryAfterSeconds: result.retryAfterSeconds },
      { "Retry-After": String(result.retryAfterSeconds) },
    );
  }
}
