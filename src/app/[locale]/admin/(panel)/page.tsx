import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/db";
import { AdminCard, Stat, Badge } from "@/components/admin/ui";
import { INTENT_LABELS, STATUS_LABELS, STATUS_TONE, formatDateTime, percent } from "@/lib/format";
import { pendingFacts } from "@/content/brand";
import { ArrowUpRight } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const l = (ru: string, kz: string) => (locale === "kz" ? kz : ru);

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [total, newCount, todayCount, weekLeads, visitsWeek, visitsTotal, bySource, byStatus, recent, errorCount] =
    await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "new" } }),
      prisma.lead.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.lead.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.pageView.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.pageView.count(),
      prisma.lead.groupBy({ by: ["source"], _count: { _all: true }, orderBy: { _count: { source: "desc" } } }),
      prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 7 }),
      prisma.integrationLog.count({ where: { status: "error" } }),
    ]);

  const conversion = visitsWeek > 0 ? (weekLeads / visitsWeek) * 100 : 0;
  const maxSource = Math.max(1, ...bySource.map((s) => s._count._all));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display-m text-[1.5rem]">{t.admin.dashboard}</h1>
          <p className="mt-1 text-[0.8rem] text-[var(--color-faint)]">
            {l("Данные за последние 7 дней и за всё время", "Соңғы 7 күн және барлық уақыт деректері")}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/${locale}/admin/leads`} className="btn btn-ghost btn-sm">
            {t.admin.leads}
          </Link>
          <a href="/api/admin/leads/export" className="btn btn-primary btn-sm">
            {t.admin.export}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label={t.admin.totalLeads} value={total} />
        <Stat label={t.admin.newLeads} value={newCount} hint={l("ожидают обработки", "өңдеуді күтеді")} />
        <Stat label={t.admin.today} value={todayCount} />
        <Stat label={t.admin.week} value={weekLeads} />
        <Stat
          label={t.admin.conversion}
          value={`${conversion.toFixed(1)}%`}
          hint={`${visitsWeek} ${l("визитов", "кіру")} / 7 ${l("дней", "күн")}`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <AdminCard
          title={t.admin.sources}
          description={l(
            "Источник определяется по UTM-метке или referrer при первом визите.",
            "Дереккөз UTM белгісі немесе бірінші кірудегі referrer бойынша анықталады.",
          )}
        >
          {bySource.length === 0 ? (
            <p className="text-[0.8rem] text-[var(--color-faint)]">{t.admin.empty}</p>
          ) : (
            <ul className="space-y-3">
              {bySource.map((row) => (
                <li key={row.source}>
                  <div className="flex items-baseline justify-between gap-3 text-[0.8rem]">
                    <span className="capitalize text-[var(--color-muted)]">{row.source}</span>
                    <span className="tabular text-[var(--color-faint)]">
                      {row._count._all} · {percent(row._count._all, total)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.07)]">
                    <div
                      className="h-full rounded-full bg-[var(--color-accent)]"
                      style={{ width: `${(row._count._all / maxSource) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 border-t border-[var(--color-line)] pt-3 text-[0.7rem] text-[var(--color-faint)]">
            {t.admin.visits}: {visitsWeek} / 7 {l("дней", "күн")} · {visitsTotal} {l("всего", "барлығы")}
          </p>
        </AdminCard>

        <AdminCard title={t.admin.statusBreakdown}>
          <ul className="space-y-2.5">
            {byStatus.length === 0 ? (
              <li className="text-[0.8rem] text-[var(--color-faint)]">{t.admin.empty}</li>
            ) : (
              byStatus.map((row) => (
                <li key={row.status} className="flex items-center justify-between gap-3">
                  <Badge tone={STATUS_TONE[row.status]}>{STATUS_LABELS[row.status] ?? row.status}</Badge>
                  <span className="text-[0.85rem] tabular text-[var(--color-muted)]">{row._count._all}</span>
                </li>
              ))
            )}
          </ul>
          <div className="mt-4 border-t border-[var(--color-line)] pt-3">
            <p className="text-[0.7rem] text-[var(--color-faint)]">
              {t.admin.integrationErrors}:{" "}
              <Link href={`/${locale}/admin/integrations`} className="text-[var(--color-accent-soft)] hover:underline">
                {errorCount}
              </Link>
            </p>
          </div>
        </AdminCard>
      </div>

      <AdminCard
        title={t.admin.recent}
        action={
          <Link href={`/${locale}/admin/leads`} className="text-[0.75rem] text-[var(--color-muted)] hover:text-[var(--color-text)]">
            {t.admin.all} →
          </Link>
        }
      >
        {recent.length === 0 ? (
          <p className="text-[0.8rem] text-[var(--color-faint)]">{t.admin.empty}</p>
        ) : (
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <table className="admin-table min-w-[720px]">
              <thead>
                <tr>
                  <th scope="col">{t.admin.leadId}</th>
                  <th scope="col">{l("Имя", "Есімі")}</th>
                  <th scope="col">{l("Интерес", "Қызығушылық")}</th>
                  <th scope="col">{t.admin.source}</th>
                  <th scope="col">{t.admin.status}</th>
                  <th scope="col">{t.admin.created}</th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {recent.map((lead) => (
                  <tr key={lead.id}>
                    <td className="tabular text-[var(--color-faint)]">{lead.publicId}</td>
                    <td>
                      <span className="block font-medium">{lead.name}</span>
                      <span className="block text-[0.72rem] tabular text-[var(--color-faint)]">{lead.phone}</span>
                    </td>
                    <td className="text-[var(--color-muted)]">{INTENT_LABELS[lead.intent] ?? lead.intent}</td>
                    <td className="capitalize text-[var(--color-muted)]">{lead.source}</td>
                    <td>
                      <Badge tone={STATUS_TONE[lead.status]}>{STATUS_LABELS[lead.status] ?? lead.status}</Badge>
                    </td>
                    <td className="whitespace-nowrap text-[0.75rem] text-[var(--color-faint)]">
                      {formatDateTime(lead.createdAt)}
                    </td>
                    <td>
                      <Link
                        href={`/${locale}/admin/leads/${lead.id}`}
                        className="inline-flex items-center gap-1 text-[0.75rem] text-[var(--color-accent-soft)] hover:underline"
                      >
                        {t.admin.openLead}
                        <ArrowUpRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <AdminCard
        title={t.admin.pendingFacts}
        description={l(
          "Эти данные школа не публикует в открытых источниках — заполните их, чтобы убрать пометку «уточняется».",
          "Бұл деректерді мектеп ашық көздерде жарияламайды — «нақтылануда» белгісін алу үшін толтырыңыз.",
        )}
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          {pendingFacts.map((fact) => (
            <li key={fact.key} className="flex items-start gap-2 text-[0.8rem] text-[var(--color-muted)]">
              <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
              {locale === "kz" ? fact.kz : fact.ru}
            </li>
          ))}
        </ul>
      </AdminCard>
    </div>
  );
}
