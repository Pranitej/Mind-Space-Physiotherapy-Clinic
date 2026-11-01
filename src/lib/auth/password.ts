import "server-only";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual, type ScryptOptions } from "node:crypto";

/**
 * Admin password hashing with scrypt (memory-hard KDF, built into Node — no
 * native dependency to break on Vercel).
 *
 * Stored format: `scrypt:<N>:<r>:<p>:<salt>:<hash>` with base64url salt/hash.
 * Colons (not `$`) are used as separators because Next.js expands `$VAR`
 * sequences inside .env files, which would silently corrupt the hash.
 *
 * `scripts/hash-password.mjs` produces hashes in this same format.
 */
const KEY_LENGTH = 64;
const DEFAULT_PARAMS = { N: 2 ** 15, r: 8, p: 1 } as const;

function scrypt(password: string, salt: Buffer, keyLength: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

function maxmemFor(N: number, r: number) {
  // scrypt needs ~128 * N * r bytes; allow headroom over Node's 32 MiB default.
  return 256 * N * r;
}

export async function hashPassword(password: string): Promise<string> {
  const { N, r, p } = DEFAULT_PARAMS;
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEY_LENGTH, { N, r, p, maxmem: maxmemFor(N, r) });
  return ["scrypt", N, r, p, salt.toString("base64url"), hash.toString("base64url")].join(":");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, nRaw, rRaw, pRaw, saltRaw, hashRaw] = parts;
  const N = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  if (!isSupportedCost(N, r, p)) return false;

  const salt = Buffer.from(saltRaw, "base64url");
  const expected = Buffer.from(hashRaw, "base64url");
  if (expected.length === 0) return false;

  let actual: Buffer;
  try {
    actual = await scrypt(password, salt, expected.length, { N, r, p, maxmem: maxmemFor(N, r) });
  } catch {
    // A malformed stored hash must fail closed, not surface as a 500.
    return false;
  }
  // Constant-time comparison prevents timing attacks on the hash.
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** N must be a power of two; bounds also cap memory use for a tampered hash. */
function isSupportedCost(N: number, r: number, p: number): boolean {
  const isPowerOfTwo = Number.isSafeInteger(N) && N >= 2 && (N & (N - 1)) === 0;
  return (
    isPowerOfTwo &&
    N <= 2 ** 20 &&
    Number.isSafeInteger(r) &&
    r >= 1 &&
    r <= 32 &&
    Number.isSafeInteger(p) &&
    p >= 1 &&
    p <= 16
  );
}
