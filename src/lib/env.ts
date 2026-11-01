import "server-only";
import { z } from "zod";

/**
 * Server-side environment, validated once on first use.
 *
 * Validation is lazy (not at import time) so that `next build` succeeds without
 * production secrets, while any request that needs a missing or malformed
 * secret fails fast with a clear message instead of misbehaving.
 */
/** Treats blank values (e.g. `KEY=""` copied from .env.example) as unset. */
const blankAsUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z
    .string()
    .regex(/^mongodb(\+srv)?:\/\//, "MONGODB_URI must be a mongodb:// or mongodb+srv:// connection string"),
  MONGODB_DB_NAME: z.preprocess(blankAsUndefined, z.string().min(1).default("mindspace")),
  /** Optional: without it emails are simulated (logged) instead of sent. */
  RESEND_API_KEY: z.preprocess(blankAsUndefined, z.string().startsWith("re_").optional()),
  EMAIL_FROM: z.preprocess(
    blankAsUndefined,
    z.string().min(3).default("Mind Space Physiotherapy Clinic <onboarding@resend.dev>"),
  ),
  /** Inbox that receives new-enquiry notifications for the clinic. */
  CLINIC_NOTIFICATION_EMAIL: z.preprocess(blankAsUndefined, z.email().optional()),
  /** Output of `npm run hash-password`. Never store the plain password. */
  ADMIN_PASSWORD_HASH: z
    .string()
    .regex(
      /^scrypt:\d+:\d+:\d+:[A-Za-z0-9_-]+:[A-Za-z0-9_-]+$/,
      "ADMIN_PASSWORD_HASH must be generated with `npm run hash-password`",
    ),
  /** HMAC key for admin session tokens and IP hashing. */
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid server environment variables:\n${issues}`);
  }

  cached = parsed.data;
  return cached;
}

export const isProduction = process.env.NODE_ENV === "production";
