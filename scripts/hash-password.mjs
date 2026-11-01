#!/usr/bin/env node
/**
 * Generates an ADMIN_PASSWORD_HASH value.
 *
 *   npm run hash-password -- "your-strong-password"
 *
 * Output format must stay in sync with src/lib/auth/password.ts.
 */
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run hash-password -- "your-strong-password"');
  process.exit(1);
}
if (password.length < 12) {
  console.error("Refusing to hash: use a password of at least 12 characters.");
  process.exit(1);
}

const N = 2 ** 15;
const r = 8;
const p = 1;
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64, { N, r, p, maxmem: 256 * N * r });

console.log(["scrypt", N, r, p, salt.toString("base64url"), hash.toString("base64url")].join(":"));
