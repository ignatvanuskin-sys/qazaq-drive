import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "./db";

const COOKIE = "qds_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    // Fail closed in production; allow a dev-only fallback so `npm run dev`
    // works out of the box.
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET is not configured (min 32 chars)");
    }
    return "dev-only-insecure-secret-change-me-please-32";
  }
  return value;
}

/* ----------------------------- passwords ----------------------------- */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, salt, hash] = stored.split(":");
    if (scheme !== "scrypt" || !salt || !hash) return false;
    const candidate = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    if (candidate.length !== expected.length) return false;
    return timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

/* ------------------------------ sessions ----------------------------- */

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function encode(userId: string): string {
  const body = Buffer.from(
    JSON.stringify({ uid: userId, exp: Date.now() + MAX_AGE * 1000 }),
  ).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token: string): { uid: string } | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString()) as {
      uid: string;
      exp: number;
    };
    if (!parsed.uid || typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;
    return { uid: parsed.uid };
  } catch {
    return null;
  }
}

export async function createSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, encode(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export const getSessionUser = cache(async () => {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const decoded = decode(token);
  if (!decoded) return null;
  const user = await prisma.adminUser.findUnique({
    where: { id: decoded.uid },
    select: { id: true, email: true, name: true, role: true },
  });
  return user;
});

export async function requireAdmin(locale = "ru") {
  const user = await getSessionUser();
  if (!user) redirect(`/${locale}/admin/login`);
  return user;
}

/** For route handlers: returns the user or null (caller returns 401). */
export async function getApiAdmin() {
  return getSessionUser();
}
