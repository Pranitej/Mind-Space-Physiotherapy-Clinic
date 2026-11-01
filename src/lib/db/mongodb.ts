import "server-only";
import { MongoClient, type Db } from "mongodb";
import { getServerEnv } from "@/lib/env";

/**
 * MongoDB connection management for a serverless runtime.
 *
 * A single MongoClient (which owns a connection pool) is created per runtime
 * instance and reused across invocations via `globalThis`. In development this
 * also survives hot reloads, which would otherwise leak a new pool per edit.
 */
const globalForMongo = globalThis as typeof globalThis & {
  __mongoClientPromise?: Promise<MongoClient>;
};

function createClient(): Promise<MongoClient> {
  const { MONGODB_URI } = getServerEnv();
  const client = new MongoClient(MONGODB_URI, {
    appName: "mindspace-website",
    // Small pool: each serverless instance handles few concurrent requests.
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8_000,
  });
  return client.connect();
}

export function getMongoClient(): Promise<MongoClient> {
  if (!globalForMongo.__mongoClientPromise) {
    globalForMongo.__mongoClientPromise = createClient().catch((error: unknown) => {
      // Do not cache a failed connection attempt; let the next request retry.
      globalForMongo.__mongoClientPromise = undefined;
      throw error;
    });
  }
  return globalForMongo.__mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(getServerEnv().MONGODB_DB_NAME);
}

/** Collection names in one place to avoid typos across repositories. */
export const collections = {
  enquiries: "enquiries",
  rateLimits: "rate_limits",
} as const;
