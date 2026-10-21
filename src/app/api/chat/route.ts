import { chatSchema } from "@/lib/validation";
import { complete, extractLead } from "@/lib/ai";
import { integrations } from "@/lib/integrations";
import { createLead } from "@/lib/leads";
import { prisma } from "@/lib/db";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { isBurst, json, tooMany } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAILY_LIMIT = Number(process.env.AI_DAILY_MESSAGE_LIMIT ?? 400);

export async function POST(request: Request) {
  if (!integrations.ai) {
    return json({ ok: false, disabled: true, code: "ai_not_configured" }, 503);
  }

  const key = clientKey(request.headers, "chat");
  if (isBurst(key, 900)) return tooMany(1);

  const limit = await rateLimit(key, 20, 10 * 60 * 1000);
  if (!limit.ok) return tooMany(limit.retryAfterSec);

  const parsed = chatSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ ok: false, code: "validation" }, 422);
  const { sessionId, locale, message, history } = parsed.data;

  // Hard cost ceiling: stop answering once the daily budget is exhausted.
  try {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const today = await prisma.chatMessage.count({
      where: { role: "assistant", createdAt: { gte: since } },
    });
    if (today >= DAILY_LIMIT) {
      return json({ ok: false, disabled: true, code: "ai_daily_limit" }, 503);
    }
  } catch {
    /* if counting fails, continue — the per-IP limiter still applies */
  }

  const sessionLimit = await rateLimit(`chat-session:${sessionId}`, 40, 60 * 60 * 1000);
  if (!sessionLimit.ok) return tooMany(sessionLimit.retryAfterSec);

  const turns = [
    ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: message },
  ];

  const result = await complete(turns, locale);
  if (!result.ok) {
    return json({ ok: false, disabled: true, code: result.error }, 503);
  }

  const { text, lead } = extractLead(result.content);
  let leadPublicId: string | null = null;

  if (lead) {
    const created = await createLead(
      {
        name: lead.name,
        phone: lead.phone,
        intent: (["start", "price", "consult", "schedule"].includes(lead.intent)
          ? lead.intent
          : "consult") as "start" | "price" | "consult" | "schedule",
        format: "unspecified",
        contactMethod: "phone",
        contactWindow: "any",
        comment: `AI-консультант: ${message.slice(0, 300)}`,
        consent: true,
        locale,
        source: "site",
        pagePath: `/${locale}`,
      },
      {
        origin: "chat",
        aiTranscript: JSON.stringify(turns.slice(-8)).slice(0, 4000),
      },
    );
    if (created.ok) leadPublicId = created.publicId;
  }

  try {
    await prisma.chatMessage.createMany({
      data: [
        { sessionId, role: "user", content: message, locale },
        { sessionId, role: "assistant", content: text, locale, leadId: leadPublicId },
      ],
    });
  } catch {
    /* transcript logging is best-effort */
  }

  return json({ ok: true, reply: text, leadPublicId });
}
