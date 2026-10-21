import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import nodemailer from "nodemailer";
import { brand } from "@/content/brand";
import { prisma } from "./db";
import { formatKzPhone } from "./validation";

export type IntegrationChannel = "telegram" | "crm" | "email" | "ai";

export const integrations = {
  telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
  crm: Boolean(process.env.CRM_WEBHOOK_URL),
  email: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
  ai: Boolean(process.env.AI_API_KEY && process.env.AI_BASE_URL && process.env.AI_MODEL),
  whatsapp: Boolean(brand.contact.whatsapp),
} as const;

async function log(
  channel: IntegrationChannel,
  status: "success" | "error" | "skipped",
  message: string | null,
  leadId?: string | null,
  attempts = 1,
) {
  try {
    await prisma.integrationLog.create({
      data: { channel, status, message: message?.slice(0, 900) ?? null, leadId, attempts },
    });
  } catch {
    /* logging must never break the request */
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
): Promise<{ ok: true; value: T } | { ok: false; error: string }> {
  let lastError = "unknown_error";
  for (let i = 1; i <= attempts; i++) {
    try {
      return { ok: true, value: await fn() };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (i < attempts) await sleep(400 * i);
    }
  }
  return { ok: false, error: lastError };
}

/* ------------------------------- Telegram ------------------------------ */

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const intentLabels: Record<string, string> = {
  start: "Начать обучение",
  price: "Узнать стоимость",
  consult: "Консультация",
  schedule: "Уточнить расписание",
};

export function telegramStatusKeyboard(leadId: string, publicId: string) {
  const waText = encodeURIComponent(
    `Здравствуйте! Пишу по заявке ${publicId} с сайта QAZAQ DRIVE SCHOOL.`,
  );
  return {
    inline_keyboard: [
      [
        { text: "💬 Связаться", url: `https://wa.me/${brand.contact.whatsapp}?text=${waText}` },
        { text: "📞 Позвонить", url: `tel:${brand.contact.phoneRaw}` },
      ],
      [
        { text: "🟡 В работе", callback_data: `st:contacted:${leadId}` },
        { text: "🟢 Обработана", callback_data: `st:done:${leadId}` },
      ],
    ],
  };
}

export async function notifyTelegram(lead: {
  id: string;
  publicId: string;
  name: string;
  phone: string;
  intent: string;
  programSlug?: string | null;
  format?: string | null;
  contactMethod?: string | null;
  contactWindow?: string | null;
  comment?: string | null;
  source: string;
  createdAt: Date;
  locale: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!integrations.telegram) {
    await log("telegram", "skipped", "TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set", lead.id);
    return { ok: false, error: "not_configured" };
  }

  const lines = [
    "🚗 <b>Новая заявка — QAZAQ DRIVE SCHOOL</b>",
    "",
    `<b>ID:</b> <code>${esc(lead.publicId)}</code>`,
    `<b>Имя:</b> ${esc(lead.name)}`,
    `<b>Телефон:</b> ${esc(formatKzPhone(lead.phone))}`,
    `<b>Интерес:</b> ${esc(intentLabels[lead.intent] ?? lead.intent)}`,
    lead.programSlug ? `<b>Категория:</b> ${esc(lead.programSlug)}` : null,
    lead.format && lead.format !== "unspecified" ? `<b>Формат:</b> ${esc(lead.format)}` : null,
    lead.contactMethod ? `<b>Связь:</b> ${esc(lead.contactMethod)}` : null,
    lead.contactWindow ? `<b>Удобное время:</b> ${esc(lead.contactWindow)}` : null,
    `<b>Источник:</b> ${esc(lead.source)}`,
    lead.comment ? `<b>Комментарий:</b> ${esc(lead.comment)}` : null,
    `<b>Язык:</b> ${lead.locale.toUpperCase()}`,
    `<b>Создана:</b> ${lead.createdAt.toLocaleString("ru-RU", { timeZone: "Asia/Almaty" })}`,
  ].filter(Boolean);

  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const chatId = process.env.TELEGRAM_CHAT_ID!;

  const result = await withRetry(async () => {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: telegramStatusKeyboard(lead.id, lead.publicId),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`telegram_${res.status}: ${body.slice(0, 200)}`);
    }
    return true;
  });

  await log("telegram", result.ok ? "success" : "error", result.ok ? null : result.error, lead.id, 3);
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

/** Confirm a webhook call really came from Telegram (secret-token header). */
export function verifyTelegramSecret(header: string | null): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/* ---------------------------------- CRM -------------------------------- */

export async function syncCrm(lead: Record<string, unknown> & { publicId: string; id: string }) {
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) {
    await log("crm", "skipped", "CRM_WEBHOOK_URL not set", lead.id);
    return { ok: false, error: "not_configured" };
  }
  const body = JSON.stringify({
    event: "lead.created",
    idempotencyKey: lead.publicId,
    lead,
    school: { name: brand.name, city: brand.city },
  });

  const signature = process.env.CRM_WEBHOOK_SECRET
    ? createHmac("sha256", process.env.CRM_WEBHOOK_SECRET).update(body).digest("hex")
    : "";

  const result = await withRetry(async () => {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-qds-signature": signature,
        "x-idempotency-key": lead.publicId,
      },
      body,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`crm_${res.status}`);
    return true;
  });

  if (result.ok) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { crmSyncedAt: new Date(), crmError: null },
    });
  } else {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { crmError: result.error ?? "unknown" },
    });
  }
  await log("crm", result.ok ? "success" : "error", result.ok ? null : result.error, lead.id, 3);
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

/* --------------------------------- Email ------------------------------- */

function transport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

export async function sendEmailNotifications(lead: {
  id: string;
  publicId: string;
  name: string;
  phone: string;
  intent: string;
  programSlug?: string | null;
  comment?: string | null;
  source: string;
  createdAt: Date;
  locale: string;
}) {
  if (!integrations.email) {
    await log("email", "skipped", "SMTP credentials not set", lead.id);
    return { ok: false, error: "not_configured" };
  }
  const adminTo = process.env.ADMIN_EMAIL ?? brand.contact.email;

  const result = await withRetry(async () => {
    await transport().sendMail({
      from: process.env.EMAIL_FROM ?? `QAZAQ DRIVE SCHOOL <${process.env.SMTP_USER}>`,
      to: adminTo,
      subject: `Новая заявка ${lead.publicId} — ${lead.name}`,
      text: [
        `Заявка ${lead.publicId}`,
        `Имя: ${lead.name}`,
        `Телефон: ${formatKzPhone(lead.phone)}`,
        `Интерес: ${intentLabels[lead.intent] ?? lead.intent}`,
        lead.programSlug ? `Категория: ${lead.programSlug}` : "",
        lead.comment ? `Комментарий: ${lead.comment}` : "",
        `Источник: ${lead.source}`,
        `Создана: ${lead.createdAt.toISOString()}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    // The form deliberately collects no email address (data minimisation), so
    // there is no client copy. Enable it by adding an email field if needed.
    return true;
  });

  await log("email", result.ok ? "success" : "error", result.ok ? null : result.error, lead.id, 3);
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}
