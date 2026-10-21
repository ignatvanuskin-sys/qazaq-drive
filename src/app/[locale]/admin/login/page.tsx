import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getSessionUser } from "@/lib/auth";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { loginAction } from "../actions";
import { brand } from "@/content/brand";

export const metadata: Metadata = {
  title: "Admin — QAZAQ DRIVE SCHOOL",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ e?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) redirect("/ru/admin/login");
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const { e } = await searchParams;
  const existing = await getSessionUser();
  if (existing) redirect(`/${locale}/admin`);

  const l = (ru: string, kz: string) => (locale === "kz" ? kz : ru);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--color-ink)] px-4 py-10">
      <div className="w-full max-w-[380px]">
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <span aria-hidden className="flex size-8 items-center justify-center rounded-[7px] border border-[var(--color-line-strong)]">
            <span className="block size-2.5 rotate-45 border border-[var(--color-accent)]" />
          </span>
          <span className="leading-none">
            <span className="block text-[0.95rem] font-extrabold tracking-[0.14em]">QAZAQ</span>
            <span className="mt-1 block text-[0.55rem] font-semibold tracking-[0.34em] text-[var(--color-muted)]">
              DRIVE SCHOOL
            </span>
          </span>
        </Link>

        <h1 className="display-m mt-8 text-[1.5rem]">{t.admin.login}</h1>
        <p className="mt-2 text-[0.82rem] text-[var(--color-muted)]">{t.admin.loginHint}</p>

        {e ? (
          <p className="mt-4 rounded-[6px] border border-[rgba(224,108,90,0.4)] bg-[rgba(224,108,90,0.1)] px-3 py-2 text-[0.8rem] text-[#f0937f]" role="alert">
            {e === "rate" ? t.admin.tooMany : t.admin.invalid}
          </p>
        ) : null}

        <form action={loginAction} className="mt-6 space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <label className="block">
            <span className="field-label">{t.admin.email}</span>
            <input
              className="field"
              type="email"
              name="email"
              autoComplete="username"
              required
              placeholder="admin@qazaqdrive.kz"
            />
          </label>
          <label className="block">
            <span className="field-label">{t.admin.password}</span>
            <input
              className="field"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              minLength={8}
            />
          </label>
          <SubmitButton className="btn btn-primary w-full" pendingLabel={l("Входим…", "Кіруде…")}>
            {t.admin.signIn}
          </SubmitButton>
        </form>

        <p className="mt-6 text-[0.7rem] leading-relaxed text-[var(--color-faint)]">
          {l(
            "Доступ только для администраторов. Все действия в панели фиксируются.",
            "Тек әкімшілер үшін. Панельдегі барлық әрекеттер тіркеледі.",
          )}
        </p>
        <p className="mt-1 text-[0.7rem] text-[var(--color-faint)]">
          {l("Первичный пользователь создаётся командой `npm run db:seed`.", "Бастапқы пайдаланушы `npm run db:seed` арқылы жасалады.")}
        </p>
        <p className="mt-4 text-[0.66rem] text-[var(--color-faint)]">{brand.name} · {brand.city}</p>
      </div>
    </div>
  );
}
