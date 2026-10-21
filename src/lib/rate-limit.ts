import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "./db";

export type LimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
};

/**
 * Durable fixed-window limiter backed by the database, so limits survive
 * serverless cold starts and multi-instance deploys. Falls back to an
 * in-memory window if the database is unreachable — the guard must never
 * silently disappear.
 */
const memory = new Map<string, { count: number; expiresAt: number }>();

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<LimitResult> {
  const now = Date.now();
  const expiresAt = new Date(now + windowMs);

  try {
    const bucket = await prisma.rateLimitBucket.upsert({
      where: { key },
      create: { key, count: 1, expiresAt },
      update: { count: { increment: 1 } },
    });

    if (bucket.expiresAt.getTime() < now) {
      await prisma.rateLimitBucket.update({
        where: { key },
        data: { count: 1, expiresAt },
      });
      return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
    }

    const remaining = Math.max(0, limit - bucket.count);
    return {
      ok: bucket.count <= limit,
      remaining,
      retryAfterSec: Math.max(1, Math.ceil((bucket.expiresAt.getTime() - now) / 1000)),
    };
  } catch {
    const entry = memory.get(key);
    if (!entry || entry.expiresAt < now) {
      memory.set(key, { count: 1, expiresAt: now + windowMs });
      return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
    }
    entry.count += 1;
    return {
      ok: entry.count <= limit,
      remaining: Math.max(0, limit - entry.count),
      retryAfterSec: Math.ceil((entry.expiresAt - now) / 1000),
    };
  }
}

/** Stable, non-reversible client identifier for logs and limits. */
export function clientKey(headers: Headers, scope: string): string {
  const forwarded = headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || headers.get("x-real-ip") || "local";
  const ua = headers.get("user-agent") ?? "";
  return `${scope}:${hash(ip + "|" + ua.slice(0, 80))}`;
}

export function hash(value: string): string {
  return createHash("sha256")
    .update(value + (process.env.HASH_SALT ?? "qds-salt"))
    .digest("hex")
    .slice(0, 32);
}

/** Occasionally clear expired buckets so the table cannot grow forever. */
export async function pruneRateLimits(): Promise<void> {
  try {
    await prisma.rateLimitBucket.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  } catch {
    /* non-critical */
  }
}
