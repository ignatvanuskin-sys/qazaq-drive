import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export function PageHero({
  eyebrow,
  title,
  lead,
  locale,
  breadcrumb,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  locale: Locale;
  breadcrumb: { label: string; href?: string }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-line)]">
      <div aria-hidden className="grid-texture pointer-events-none absolute inset-x-0 top-0 h-[380px] opacity-60" />
      <div className="container-page relative pb-10 pt-8 sm:pb-14 sm:pt-12">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-2 text-[0.72rem] text-[var(--color-faint)]">
            <li>
              <Link href={`/${locale}`} className="hover:text-[var(--color-muted)]">
                {locale === "kz" ? "Басты бет" : "Главная"}
              </Link>
            </li>
            {breadcrumb.map((item) => (
              <li key={item.label} className="flex items-center gap-2">
                <span aria-hidden>/</span>
                {item.href ? (
                  <Link href={`/${locale}${item.href}`} className="hover:text-[var(--color-muted)]">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-[var(--color-muted)]">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="max-w-[46rem]">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display display-l mt-4">{title}</h1>
          {lead ? <p className="lead mt-5">{lead}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
