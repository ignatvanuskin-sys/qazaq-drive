import { leadSchema } from "@/lib/validation";
import { createLead } from "@/lib/leads";
import { clientKey, hash, pruneRateLimits, rateLimit } from "@/lib/rate-limit";
import { isBurst, json, tooMany } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const key = clientKey(request.headers, "lead");
  if (isBurst(key, 2000)) return tooMany(2);

  const limit = await rateLimit(key, 12, 10 * 60 * 1000);
  if (!limit.ok) return tooMany(limit.retryAfterSec);
  void pruneRateLimits();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: "invalid_json" }, 400);
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const name = issue.path[0];
      if (typeof name === "string" && !fields[name]) fields[name] = issue.message;
    }
    return json({ ok: false, code: "validation", fields }, 422);
  }

  const data = parsed.data;

  // Honeypot: real users never see this field.
  if (data.company) return json({ ok: false, code: "spam" }, 400);
  // A human cannot realistically complete four steps in under a second.
  if (typeof data.elapsedMs === "number" && data.elapsedMs < 1200) {
    return json({ ok: false, code: "too_fast" }, 400);
  }

  const ipRaw =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";

  const result = await createLead(data, {
    ipHash: hash(ipRaw),
    userAgentHash: hash(request.headers.get("user-agent") ?? ""),
    origin: "form",
  });

  if (!result.ok) {
    return json({ ok: false, code: result.reason }, result.reason === "duplicate_recent" ? 409 : 500);
  }

  return json({
    ok: true,
    publicId: result.publicId,
    duplicate: result.duplicate,
  });
}

export async function GET() {
  return json({ ok: false, code: "method_not_allowed" }, 405);
}
