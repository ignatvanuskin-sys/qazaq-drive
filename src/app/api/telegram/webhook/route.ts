import { prisma } from "@/lib/db";
import { verifyTelegramSecret } from "@/lib/integrations";
import { json } from "@/lib/http";
import { STATUSES } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TelegramUpdate = {
  callback_query?: {
    id: string;
    data?: string;
    from?: { first_name?: string; id?: number };
    message?: { chat?: { id?: number }; message_id?: number };
  };
};

const labels: Record<string, string> = {
  new: "Новая",
  contacted: "В работе",
  scheduled: "Записан",
  enrolled: "Обучается",
  done: "Обработана",
  spam: "Спам",
};

async function tg(method: string, payload: unknown) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(6000),
  }).catch(() => undefined);
}

export async function POST(request: Request) {
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (!verifyTelegramSecret(secret)) {
    return json({ ok: false }, 401);
  }

  const update = (await request.json().catch(() => null)) as TelegramUpdate | null;
  const query = update?.callback_query;
  if (!query?.data) return json({ ok: true });

  const [prefix, status, leadId] = query.data.split(":");
  if (prefix !== "st" || !leadId || !STATUSES.includes(status as never)) {
    await tg("answerCallbackQuery", { callback_query_id: query.id, text: "Неизвестное действие" });
    return json({ ok: true });
  }

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) {
    await tg("answerCallbackQuery", { callback_query_id: query.id, text: "Заявка не найдена" });
    return json({ ok: true });
  }

  const actor = query.from?.first_name ?? "telegram";

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      status,
      lastContactAt: status === "contacted" ? new Date() : lead.lastContactAt,
    },
  });
  await prisma.leadEvent.create({
    data: {
      leadId,
      type: "status",
      actor,
      payload: JSON.stringify({ from: lead.status, to: status, via: "telegram" }),
    },
  });

  await tg("answerCallbackQuery", {
    callback_query_id: query.id,
    text: `Статус: ${labels[status] ?? status}`,
  });

  if (query.message?.chat?.id && query.message.message_id) {
    await tg("editMessageReplyMarkup", {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
      reply_markup: { inline_keyboard: [] },
    });
    await tg("sendMessage", {
      chat_id: query.message.chat.id,
      text: `✅ ${lead.publicId} — ${labels[status] ?? status} (${actor})`,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
  }

  return json({ ok: true });
}
