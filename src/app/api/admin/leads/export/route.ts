import type { Prisma } from "@prisma/client";
import { getApiAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  FORMAT_LABELS,
  INTENT_LABELS,
  METHOD_LABELS,
  STATUS_LABELS,
  WINDOW_LABELS,
} from "@/lib/format";
import { STATUSES } from "@/lib/validation";
import { json } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const admin = await getApiAdmin();
  if (!admin) return json({ ok: false }, 401);

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const source = url.searchParams.get("source");
  const program = url.searchParams.get("program");
  const q = url.searchParams.get("q");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const where: Prisma.LeadWhereInput = {};
  if (status && STATUSES.includes(status as never)) where.status = status;
  if (source) where.source = source;
  if (program) where.programSlug = program;
  if (q) {
    const digits = q.replace(/\D/g, "");
    where.OR = [
      { name: { contains: q } },
      ...(digits ? [{ phone: { contains: digits } }] : []),
      { publicId: { contains: q.toUpperCase() } },
    ];
  }
  if (from || to) {
    where.createdAt = {};
    if (from) (where.createdAt as Prisma.DateTimeFilter).gte = new Date(`${from}T00:00:00`);
    if (to) (where.createdAt as Prisma.DateTimeFilter).lte = new Date(`${to}T23:59:59`);
  }

  const rows = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const header = [
    "ID",
    "Создана",
    "Имя",
    "Телефон",
    "Интерес",
    "Категория",
    "Формат",
    "Способ связи",
    "Время связи",
    "Комментарий",
    "Статус",
    "Источник",
    "UTM source",
    "UTM medium",
    "UTM campaign",
    "Страница",
    "Язык",
    "Последний контакт",
    "Внутренний комментарий",
    "Ошибка уведомления",
  ];

  const lines = [header.map(cell).join(";")];
  for (const lead of rows) {
    lines.push(
      [
        lead.publicId,
        lead.createdAt.toISOString(),
        lead.name,
        lead.phone,
        INTENT_LABELS[lead.intent] ?? lead.intent,
        lead.programSlug ?? "",
        FORMAT_LABELS[lead.format ?? "unspecified"] ?? "",
        METHOD_LABELS[lead.contactMethod ?? "phone"] ?? "",
        WINDOW_LABELS[lead.contactWindow ?? "any"] ?? "",
        lead.comment ?? "",
        STATUS_LABELS[lead.status] ?? lead.status,
        lead.source,
        lead.utmSource ?? "",
        lead.utmMedium ?? "",
        lead.utmCampaign ?? "",
        lead.pagePath ?? "",
        lead.locale,
        lead.lastContactAt?.toISOString() ?? "",
        lead.internalNotes ?? "",
        lead.notifyError ?? "",
      ]
        .map(cell)
        .join(";"),
    );
  }

  // BOM keeps Cyrillic readable in Excel; semicolons match RU locale defaults.
  const body = `\uFEFF${lines.join("\r\n")}`;
  const stamp = new Date().toISOString().slice(0, 10);

  await prisma.leadEvent.create({
    data: {
      leadId: rows[0]?.id ?? "none",
      type: "export",
      actor: admin.email,
      payload: `exported ${rows.length} leads`,
    },
  }).catch(() => undefined);

  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="qazaq-drive-leads-${stamp}.csv"`,
      "cache-control": "no-store",
    },
  });
}
