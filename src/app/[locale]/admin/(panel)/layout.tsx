import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "../actions";
import { brand } from "@/content/brand";

export const dynamic = "force-dynamic";

const NAV = [
  { key: "dashboard", href: "/admin" },
  { key: "leads", href: "/admin/leads" },
  { key: "content", href: "/admin/content" },
  { key: "integrations", href: "/admin/integrations" },
  { key: "settings", href: "/admin/settings" },
] as const;

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const user = await requireAdmin(locale);

  return (
    <div className="min-h-[100dvh] bg-[var(--color-ink)]">
      <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[rgba(8,9,10,0.92)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href={`/${locale}/admin`} className="flex items-center gap-2">
              <span aria-hidden className="flex size-7 items-center justify-center rounded-[6px] border border-[var(--color-line-strong)]">
                <span className="block size-2 rotate-45 border border-[var(--color-accent)]" />
              </span>
              <span className="text-[0.8rem] font-bold tracking-[0.12em]">QAZAQ DRIVE</span>
            </Link>
            <span className="hidden text-[0.68rem] uppercase tracking-[0.14em] text-[var(--color-faint)] sm:inline">
              {t.admin.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}`}
              target="_blank"
              className="hidden rounded-full border border-[var(--color-line)] px-3 py-1.5 text-[0.72rem] text-[var(--color-muted)] hover:text-[var(--color-text)] sm:inline-flex"
            >
              {locale === "kz" ? "Сайтты ашу" : "Открыть сайт"}
            </Link>
            <span className="hidden max-w-[160px] truncate text-[0.72rem] text-[var(--color-faint)] md:inline">
              {user.email}
            </span>
            <form action={logoutAction}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className="btn btn-ghost btn-sm !min-h-8 !px-3 !text-[0.72rem]">
                {t.admin.signOut}
              </button>
            </form>
          </div>
        </div>

        <nav aria-label="Admin" className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <ul className="no-scrollbar -mb-px flex gap-1 overflow-x-auto">
            {NAV.map((item) => (
              <li key={item.key}>
                <Link
                  href={`/${locale}${item.href}`}
                  className="inline-flex whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 text-[0.8rem] text-[var(--color-muted)] transition-colors hover:border-[var(--color-line-strong)] hover:text-[var(--color-text)]"
                >
                  {t.admin[item.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">{children}</div>

      <footer className="mx-auto max-w-[1400px] px-4 pb-8 text-[0.68rem] text-[var(--color-faint)] sm:px-6">
        {brand.name} · {t.admin.title} · {locale.toUpperCase()}
      </footer>
    </div>
  );
}
