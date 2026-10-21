import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/db";
import { AdminCard, Badge } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import {
  FORMAT_LABELS,
  INTENT_LABELS,
  METHOD_LABELS,
  STATUS_LABELS,
  STATUS_TONE,
  WINDOW_LABELS,
  formatDateTime,
} from "@/lib/format";
import { STATUSES } from "@/lib/validation";
import { markContactAction, resendNotificationsAction, saveNoteAction, setLeadStatusAction } from "../../../actions";
import { Phone, WhatsApp } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function LeadDetail({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const l = (ru: string, kz: string) => (locale === "kz" ? kz : ru);

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { events: { orderBy: { createdAt: "desc" }, take: 30 } },
  });
  if (!lead) notFound();

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: l("Имя", "Есімі"), value: lead.name },
    {
      label: l("Телефон", "Телефон"),
      value: <span className="tabular">{lead.phone}</span>,
    },
    { label: l("Интерес", "Қызығушылық"), value: INTENT_LABELS[lead.intent] ?? lead.intent },
    { label: l("Категория", "Санат"), value: lead.programSlug ?? "—" },
    { label: l("Формат", "Формат"), value: FORMAT_LABELS[lead.format ?? "unspecified"] },
    { label: l("Время связи", "Байланыс уақыты"), value: WINDOW_LABELS[lead.contactWindow ?? "any"] },
    { label: l("Способ связи", "Байланыс тәсілі"), value: METHOD_LABELS[lead.contactMethod ?? "phone"] },
    { label: l("Комментарий", "Түсініктеме"), value: lead.comment ?? "—" },
    { label: l("Источник", "Дереккөз"), value: lead.source },
    {
      label: "UTM",
      value:
        [lead.utmSource, lead.utmMedium, lead.utmCampaign, lead.utmContent].filter(Boolean).join(" / ") || "—",
    },
    { label: l("Страница", "Бет"), value: lead.pagePath ?? "—" },
    { label: l("Язык", "Тіл"), value: lead.locale.toUpperCase() },
    {
      label: l("Согласие", "Келісім"),
      value: lead.consent ? l("получено", "алынды") : l("нет", "жоқ"),
    },
    { label: l("Создана", "Құрылды"), value: formatDateTime(lead.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href={`/${locale}/admin/leads`} className="text-[0.75rem] text-[var(--color-faint)] hover:text-[var(--color-muted)]">
            ← {t.admin.leads}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-[1.4rem] font-semibold tracking-[0.02em] tabular">{lead.publicId}</h1>
            <Badge tone={STATUS_TONE[lead.status]}>{STATUS_LABELS[lead.status] ?? lead.status}</Badge>
          </div>
          <p className="mt-1 text-[0.78rem] text-[var(--color-faint)]">
            {lead.name} · {lead.phone} · {formatDateTime(lead.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${lead.phone}`} className="btn btn-ghost btn-sm">
            <Phone size={14} />
            {t.cta.call}
          </a>
          <a
            href={`https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
              `${l("Здравствуйте", "Сәлеметсіз бе")}, ${lead.name}! ${l("Это QAZAQ DRIVE SCHOOL по заявке", "QAZAQ DRIVE SCHOOL, өтінім бойынша")} ${lead.publicId}.`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            <WhatsApp size={14} />
            WhatsApp
          </a>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <AdminCard title={l("Данные заявки", "Өтінім деректері")}>
            <dl className="divide-y divide-[var(--color-line)]">
              {rows.map((row) => (
                <div key={row.label} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:justify-between sm:gap-6">
                  <dt className="text-[0.72rem] uppercase tracking-[0.1em] text-[var(--color-faint)]">
                    {row.label}
                  </dt>
                  <dd className="text-[0.85rem] text-[var(--color-muted)] sm:text-right">{row.value}</dd>
                </div>
              ))}
            </dl>
          </AdminCard>

          <AdminCard title={t.admin.internalNote}>
            <form action={saveNoteAction} className="space-y-3">
              <input type="hidden" name="id" value={lead.id} />
              <input type="hidden" name="locale" value={locale} />
              <textarea
                className="field !min-h-24 !py-2 text-[0.85rem]"
                name="note"
                defaultValue={lead.internalNotes ?? ""}
                placeholder={l("Виден только администраторам", "Тек әкімшілерге көрінеді")}
                maxLength={2000}
              />
              <SubmitButton className="btn btn-primary btn-sm">{t.admin.saveNote}</SubmitButton>
            </form>
          </AdminCard>

          <AdminCard title={t.admin.history}>
            <ol className="space-y-3">
              {lead.events.length === 0 ? (
                <li className="text-[0.8rem] text-[var(--color-faint)]">{l("Событий пока нет", "Әзірге оқиға жоқ")}</li>
              ) : (
                lead.events.map((event) => (
                  <li key={event.id} className="flex gap-3 text-[0.8rem]">
                    <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                    <div>
                      <p className="text-[var(--color-muted)]">
                        <span className="font-medium text-[var(--color-text)]">{event.type}</span>
                        {event.payload ? ` — ${event.payload.slice(0, 180)}` : ""}
                      </p>
                      <p className="mt-0.5 text-[0.7rem] text-[var(--color-faint)]">
                        {formatDateTime(event.createdAt)} · {event.actor}
                      </p>
                    </div>
                  </li>
                ))
              )}
            </ol>
          </AdminCard>
        </div>

        <div className="space-y-4">
          <AdminCard title={t.admin.status}>
            <form action={setLeadStatusAction} className="space-y-3">
              <input type="hidden" name="id" value={lead.id} />
              <input type="hidden" name="locale" value={locale} />
              <select className="field !min-h-10 !py-2 text-[0.85rem]" name="status" defaultValue={lead.status}>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              <SubmitButton className="btn btn-primary btn-sm w-full">{t.admin.save}</SubmitButton>
            </form>
            <form action={markContactAction} className="mt-2">
              <input type="hidden" name="id" value={lead.id} />
              <input type="hidden" name="locale" value={locale} />
              <SubmitButton className="btn btn-ghost btn-sm w-full">{t.admin.markContact}</SubmitButton>
            </form>
            <p className="mt-3 border-t border-[var(--color-line)] pt-3 text-[0.72rem] text-[var(--color-faint)]">
              {t.admin.lastContact}:{" "}
              {lead.lastContactAt ? formatDateTime(lead.lastContactAt) : l("не зафиксирован", "тіркелмеген")}
            </p>
          </AdminCard>

          <AdminCard title={t.admin.notifyStatus}>
            <ul className="space-y-2 text-[0.78rem]">
              <li className="flex items-center justify-between gap-3">
                <span className="text-[var(--color-faint)]">{t.admin.telegramSetup}</span>
                <Badge tone={lead.notifyError ? STATUS_TONE.spam : STATUS_TONE.scheduled}>
                  {lead.notifiedAt ? (lead.notifyError ? t.admin.notifyFail : t.admin.notifyOk) : "—"}
                </Badge>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-[var(--color-faint)]">{t.admin.crmStatus}</span>
                <Badge tone={lead.crmError ? STATUS_TONE.spam : lead.crmSyncedAt ? STATUS_TONE.scheduled : undefined}>
                  {lead.crmError ? t.admin.notifyFail : lead.crmSyncedAt ? t.admin.notifyOk : "—"}
                </Badge>
              </li>
            </ul>
            {lead.notifyError || lead.crmError ? (
              <p className="mt-3 rounded-[6px] border border-[rgba(224,108,90,0.35)] bg-[rgba(224,108,90,0.08)] p-2.5 text-[0.72rem] leading-relaxed text-[#f0937f]">
                {lead.notifyError ?? lead.crmError}
              </p>
            ) : null}
            <form action={resendNotificationsAction} className="mt-3">
              <input type="hidden" name="id" value={lead.id} />
              <input type="hidden" name="locale" value={locale} />
              <SubmitButton className="btn btn-ghost btn-sm w-full">
                {l("Отправить повторно", "Қайта жіберу")}
              </SubmitButton>
            </form>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
