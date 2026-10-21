import Link from "next/link";
import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/db";
import { AdminCard, Badge } from "@/components/admin/ui";
import {
  INTENT_LABELS,
  STATUS_LABELS,
  STATUS_TONE,
  formatDateTime,
} from "@/lib/format";
import { STATUSES } from "@/lib/validation";
import { ArrowUpRight } from "@/components/Icons";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type Search = {
  status?: string;
  source?: string;
  program?: string;
  q?: string;
  from?: string;
  to?: string;
  page?: string;
};

export default async function LeadsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Search>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const l = (ru: string, kz: string) => (locale === "kz" ? kz : ru);
  const sp = await searchParams;

  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const where: Prisma.LeadWhereInput = {};

  if (sp.status && STATUSES.includes(sp.status as never)) where.status = sp.status;
  if (sp.source) where.source = sp.source;
  if (sp.program) where.programSlug = sp.program;
  if (sp.q) {
    const digits = sp.q.replace(/\D/g, "");
    where.OR = [
      { name: { contains: sp.q } },
      ...(digits ? [{ phone: { contains: digits } }] : []),
      { publicId: { contains: sp.q.toUpperCase() } },
    ];
  }
  if (sp.from || sp.to) {
    where.createdAt = {};
    if (sp.from) (where.createdAt as Prisma.DateTimeFilter).gte = new Date(`${sp.from}T00:00:00`);
    if (sp.to) (where.createdAt as Prisma.DateTimeFilter).lte = new Date(`${sp.to}T23:59:59`);
  }

  const [total, rows, sources] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.lead.groupBy({ by: ["source"], _count: { _all: true } }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const query = (patch: Partial<Search>) => {
    const next = new URLSearchParams();
    const merged = { ...sp, ...patch };
    for (const [key, value] of Object.entries(merged)) {
      if (value) next.set(key, String(value));
    }
    return `?${next.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display-m text-[1.5rem]">{t.admin.leads}</h1>
          <p className="mt-1 text-[0.8rem] text-[var(--color-faint)]">
            {total} {l("заявок по текущему фильтру", "өтінім ағымдағы сүзгі бойынша")}
          </p>
        </div>
        <a href={`/api/admin/leads/export${query({ page: "" })}`} className="btn btn-primary btn-sm">
          {t.admin.export}
        </a>
      </div>

      <form className="rounded-[10px] border border-[var(--color-line)] bg-[rgba(255,255,255,0.02)] p-4" method="get">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="field-label">{t.admin.search}</span>
            <input
              className="field !min-h-10 !py-2 text-[0.85rem]"
              type="search"
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="Айгуль / 708…"
            />
          </label>
          <label className="block">
            <span className="field-label">{t.admin.status}</span>
            <select className="field !min-h-10 !py-2 text-[0.85rem]" name="status" defaultValue={sp.status ?? ""}>
              <option value="">{t.admin.all}</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">{t.admin.source}</span>
            <select className="field !min-h-10 !py-2 text-[0.85rem]" name="source" defaultValue={sp.source ?? ""}>
              <option value="">{t.admin.all}</option>
              {sources.map((s) => (
                <option key={s.source} value={s.source}>
                  {s.source} ({s._count._all})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">{t.admin.program}</span>
            <select className="field !min-h-10 !py-2 text-[0.85rem]" name="program" defaultValue={sp.program ?? ""}>
              <option value="">{t.admin.all}</option>
              {[ "B", "A", "A1", "BE", "C", "C1", "CE", "D", "D1", "DE" ].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">{t.admin.dateFrom}</span>
            <input className="field !min-h-10 !py-2 text-[0.85rem]" type="date" name="from" defaultValue={sp.from ?? ""} />
          </label>
          <label className="block">
            <span className="field-label">{t.admin.dateTo}</span>
            <input className="field !min-h-10 !py-2 text-[0.85rem]" type="date" name="to" defaultValue={sp.to ?? ""} />
          </label>
          <div className="flex items-end gap-2 sm:col-span-2">
            <button type="submit" className="btn btn-primary btn-sm">
              {t.admin.apply}
            </button>
            <Link href={`/${locale}/admin/leads`} className="btn btn-ghost btn-sm">
              {t.admin.reset}
            </Link>
          </div>
        </div>
      </form>

      <AdminCard>
        {rows.length === 0 ? (
          <p className="text-[0.85rem] text-[var(--color-faint)]">{t.admin.empty}</p>
        ) : (
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <table className="admin-table min-w-[860px]">
              <thead>
                <tr>
                  <th scope="col">{t.admin.leadId}</th>
                  <th scope="col">{l("Клиент", "Клиент")}</th>
                  <th scope="col">{l("Интерес", "Қызығушылық")}</th>
                  <th scope="col">{t.admin.program}</th>
                  <th scope="col">{t.admin.source}</th>
                  <th scope="col">{t.admin.status}</th>
                  <th scope="col">{t.admin.created}</th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {rows.map((lead) => (
                  <tr key={lead.id}>
                    <td className="tabular text-[var(--color-faint)]">{lead.publicId}</td>
                    <td>
                      <span className="block font-medium">{lead.name}</span>
                      <span className="block text-[0.72rem] tabular text-[var(--color-faint)]">{lead.phone}</span>
                    </td>
                    <td className="text-[var(--color-muted)]">{INTENT_LABELS[lead.intent] ?? lead.intent}</td>
                    <td className="text-[var(--color-muted)]">{lead.programSlug ?? "—"}</td>
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

      {pages > 1 ? (
        <nav className="flex items-center justify-between gap-3" aria-label="Pagination">
          {page > 1 ? (
            <Link href={`/${locale}/admin/leads${query({ page: String(page - 1) })}`} className="btn btn-ghost btn-sm">
              ← {l("Назад", "Артқа")}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-[0.75rem] tabular text-[var(--color-faint)]">
            {page} / {pages}
          </span>
          {page < pages ? (
            <Link href={`/${locale}/admin/leads${query({ page: String(page + 1) })}`} className="btn btn-ghost btn-sm">
              {l("Вперёд", "Алға")} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
