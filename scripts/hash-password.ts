/**
 * Utility: print a scrypt hash for manual admin insertion.
 *   npx tsx scripts/hash-password.ts "your-password"
 */
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];

if (!password || password.length < 12) {
  console.error("Usage: npx tsx scripts/hash-password.ts \"min-12-char-password\"");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");
console.log(`scrypt:${salt}:${hash}`);
