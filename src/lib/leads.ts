import "server-only";
import { randomBytes } from "node:crypto";
import { prisma } from "./db";
import { hash } from "./rate-limit";
import { normalizeKzPhone, type LeadInput } from "./validation";
import { notifyTelegram, syncCrm, sendEmailNotifications } from "./integrations";

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function publicId(): string {
  const bytes = randomBytes(7);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return `QDS-${out}`;
}

/** Normalise every traffic source into a small, analysable set. */
export function resolveSource(input: {
  utmSource?: string | null;
  referrer?: string | null;
}): string {
  const utm = (input.utmSource ?? "").toLowerCase();
  if (utm) {
    if (/insta|ig|meta|facebook|fb/.test(utm)) return "instagram";
    if (/2gis|2гис/.test(utm)) return "2gis";
    if (/google|yandex|search/.test(utm)) return "search";
    if (/telegram|tg/.test(utm)) return "telegram";
    if (/whatsapp|wa/.test(utm)) return "whatsapp";
    return utm.replace(/[^a-z0-9_-]/g, "").slice(0, 40) || "other";
  }
  const ref = (input.referrer ?? "").toLowerCase();
  if (ref.includes("instagram")) return "instagram";
  if (ref.includes("2gis")) return "2gis";
  if (ref.includes("google")) return "google";
  if (ref.includes("yandex")) return "yandex";
  if (ref.includes("t.me") || ref.includes("telegram")) return "telegram";
  if (ref) return "referral";
  return "direct";
}

export type CreateLeadResult =
  | { ok: true; publicId: string; duplicate: boolean; id: string }
  | { ok: false; reason: "duplicate_recent" | "error" };

export async function createLead(
  input: LeadInput,
  meta: {
    ipHash?: string;
    userAgentHash?: string;
    origin?: "form" | "chat" | "admin";
    aiTranscript?: string;
  } = {},
): Promise<CreateLeadResult> {
  const phone = normalizeKzPhone(input.phone);
  if (!phone) return { ok: false, reason: "error" };

  const duplicateHash = hash(`${phone}:${input.intent}`);
  const since = new Date(Date.now() - 15 * 60 * 1000);

  const recent = await prisma.lead.findFirst({
    where: { duplicateHash, createdAt: { gte: since }, status: { not: "spam" } },
    select: { publicId: true, id: true },
  });
  if (recent) return { ok: true, publicId: recent.publicId, duplicate: true, id: recent.id };

  const source = resolveSource({
    utmSource: input.utm?.source,
    referrer: input.referrer,
  });

  try {
    const lead = await prisma.lead.create({
      data: {
        publicId: publicId(),
        name: input.name,
        phone,
        intent: input.intent,
        programSlug: input.programSlug || null,
        format: input.format ?? "unspecified",
        contactMethod: input.contactMethod ?? "phone",
        contactWindow: input.contactWindow ?? "any",
        comment: input.comment?.slice(0, 1000) || null,
        consent: true,
        source,
        utmSource: input.utm?.source?.slice(0, 80) ?? null,
        utmMedium: input.utm?.medium?.slice(0, 80) ?? null,
        utmCampaign: input.utm?.campaign?.slice(0, 120) ?? null,
        utmContent: input.utm?.content?.slice(0, 120) ?? null,
        referrer: input.referrer?.slice(0, 400) ?? null,
        locale: input.locale,
        pagePath: input.pagePath?.slice(0, 200) ?? null,
        origin: meta.origin ?? "form",
        aiTranscript: meta.aiTranscript ?? null,
        duplicateHash,
        ipHash: meta.ipHash ?? null,
        userAgentHash: meta.userAgentHash ?? null,
        events: {
          create: { type: "created", actor: "visitor", payload: JSON.stringify({ source }) },
        },
      },
    });

    // Best-effort fan-out. The lead is already safely persisted, so a failing
    // channel can never lose the request.
    await dispatchNotifications(lead.id).catch(() => undefined);

    return { ok: true, publicId: lead.publicId, duplicate: false, id: lead.id };
  } catch (error) {
    console.error("[leads] create failed", error);
    return { ok: false, reason: "error" };
  }
}

/** Send a lead to every configured channel and record the outcome. */
export async function dispatchNotifications(leadId: string): Promise<void> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return;

  const [tg, crm, mail] = await Promise.allSettled([
    notifyTelegram(lead),
    syncCrm({
      id: lead.id,
      publicId: lead.publicId,
      name: lead.name,
      phone: lead.phone,
      intent: lead.intent,
      program: lead.programSlug,
      format: lead.format,
      comment: lead.comment,
      source: lead.source,
      locale: lead.locale,
      createdAt: lead.createdAt.toISOString(),
    }),
    sendEmailNotifications(lead),
  ]);

  const errors = [tg, crm, mail]
    .map((r) => (r.status === "fulfilled" ? r.value?.error : r.reason))
    .filter((e): e is string => Boolean(e) && e !== "not_configured");

  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      notifiedAt: new Date(),
      notifyError: errors.length ? errors.join("; ").slice(0, 500) : null,
    },
  });

  await prisma.leadEvent.create({
    data: {
      leadId: lead.id,
      type: "notify",
      actor: "system",
      payload: JSON.stringify({
        telegram: tg.status === "fulfilled" ? tg.value : "failed",
        crm: crm.status === "fulfilled" ? crm.value : "failed",
        email: mail.status === "fulfilled" ? mail.value : "failed",
      }).slice(0, 900),
    },
  });
}
