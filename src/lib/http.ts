export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "cache-control": "no-store, max-age=0",
      "x-content-type-options": "nosniff",
    },
  });
}

export function tooMany(retryAfterSec: number) {
  return Response.json(
    { ok: false, code: "rate_limited" },
    {
      status: 429,
      headers: { "retry-after": String(retryAfterSec), "cache-control": "no-store" },
    },
  );
}

/** Very small in-memory guard against burst floods on top of the DB limiter. */
const seen = new Map<string, number>();
export function isBurst(key: string, windowMs = 1500): boolean {
  const now = Date.now();
  const last = seen.get(key);
  if (last && now - last < windowMs) return true;
  seen.set(key, now);
  if (seen.size > 5000) seen.clear();
  return false;
}
