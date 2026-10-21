import { z } from "zod";
import { prisma } from "@/lib/db";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { resolveSource } from "@/lib/leads";
import { json } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  path: z.string().max(200),
  locale: z.enum(["ru", "kz"]).default("ru"),
  source: z.string().max(60).optional(),
  referrer: z.string().max(400).optional(),
});

export async function POST(request: Request) {
  const key = clientKey(request.headers, "track");
  const limit = await rateLimit(key, 90, 60 * 1000);
  if (!limit.ok) return new Response(null, { status: 204 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 204 });

  const { path, locale, source, referrer } = parsed.data;
  const ua = request.headers.get("user-agent") ?? "";
  const device = /Mobi|Android|iPhone/i.test(ua) ? "mobile" : /iPad|Tablet/i.test(ua) ? "tablet" : "desktop";

  // Never store admin or API traffic in analytics.
  if (path.includes("/admin") || path.startsWith("/api")) return new Response(null, { status: 204 });

  try {
    await prisma.pageView.create({
      data: {
        path: path.slice(0, 200),
        locale,
        source: source ? resolveSource({ utmSource: source, referrer }) : resolveSource({ referrer }),
        referrer: referrer?.slice(0, 400) ?? null,
        device,
      },
    });
  } catch {
    /* analytics must never break a page */
  }

  return new Response(null, { status: 204 });
}

export async function GET() {
  return json({ ok: false }, 405);
}
