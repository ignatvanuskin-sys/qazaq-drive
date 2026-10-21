import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { getPrograms, priceLabel } from "@/lib/content";
import { brand } from "@/content/brand";
import { PageHero } from "@/components/PageHero";
import { BookButton } from "@/components/booking/BookButton";
import { ArrowRight, Check, Shield } from "@/components/Icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale === "kz" ? "kz" : "ru", "programs");
}

export default async function ProgramsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const programs = await getPrograms(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd(locale, [
              { name: t.nav.programs, path: "/programs" },
            ]),
          ),
        }}
      />
      <PageHero
        eyebrow={t.programs.title}
        title={t.programs.h1}
        lead={t.programs.lead}
        locale={locale}
        breadcrumb={[{ label: t.nav.programs }]}
      >
        <div className="mt-8 flex flex-wrap gap-1.5">
          {brand.categories.map((c) => (
            <span key={c} className="chip">
              {c}
            </span>
          ))}
        </div>
      </PageHero>

      <section className="section-tight">
        <div className="container-page">
          <div className="grid gap-4 lg:grid-cols-2">
            {programs.map((program, i) => (
              <article key={program.slug} className="card flex flex-col p-6 sm:p-8" data-reveal>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="chip chip-accent">{program.category}</span>
                    <h2 className="mt-4 max-w-[22rem] text-[1.25rem] font-semibold leading-snug sm:text-[1.4rem]">
                      {program.title}
                    </h2>
                  </div>
                  <span className="text-[0.7rem] tabular text-[var(--color-faint)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <p className="mt-4 text-[0.9rem] leading-relaxed text-[var(--color-muted)]">
                  {program.summary}
                </p>

                <dl className="mt-6 grid gap-3 border-t border-[var(--color-line)] pt-5 text-[0.85rem] sm:grid-cols-2">
                  <div>
                    <dt className="text-[0.72rem] uppercase tracking-[0.1em] text-[var(--color-faint)]">
                      {t.programs.duration}
                    </dt>
                    <dd className="mt-1 text-[var(--color-muted)]">
                      {program.duration ?? (
                        <span className="text-[var(--color-accent-soft)]">{t.ui.toBeConfirmed}</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.72rem] uppercase tracking-[0.1em] text-[var(--color-faint)]">
                      {t.programs.transmission}
                    </dt>
                    <dd className="mt-1 text-[var(--color-muted)]">
                      {program.transmission === "manual"
                        ? t.fleet.transmissionManual
                        : program.transmission === "automatic"
                          ? t.fleet.transmissionAuto
                          : program.transmission === "both"
                            ? t.fleet.transmissionBoth
                            : t.ui.toBeConfirmed}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.72rem] uppercase tracking-[0.1em] text-[var(--color-faint)]">
                      {t.programs.theory}
                    </dt>
                    <dd className="mt-1 leading-relaxed text-[var(--color-muted)]">
                      {program.theory ?? t.ui.toBeConfirmed}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.72rem] uppercase tracking-[0.1em] text-[var(--color-faint)]">
                      {t.programs.practice}
                    </dt>
                    <dd className="mt-1 leading-relaxed text-[var(--color-muted)]">
                      {program.practice ?? t.ui.toBeConfirmed}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 border-t border-[var(--color-line)] pt-5">
                  <p className="text-[0.72rem] uppercase tracking-[0.1em] text-[var(--color-faint)]">
                    {t.programs.included}
                  </p>
                  <ul className="mt-3 grid gap-2">
                    {program.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-[0.85rem] text-[var(--color-muted)]">
                        <Check size={12} className="mt-1 shrink-0 text-[var(--color-accent)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
                  <div>
                    <p className="text-[0.72rem] uppercase tracking-[0.1em] text-[var(--color-faint)]">
                      {t.programs.priceLabel}
                    </p>
                    <p className="mt-1 text-[1.15rem] font-semibold">
                      {priceLabel(program.price) ?? (
                        <span className="text-[var(--color-accent-soft)]">{t.ui.priceOnRequest}</span>
                      )}
                    </p>
                  </div>
                  <BookButton
                    className="btn btn-primary btn-sm"
                    intent="price"
                    program={program.category.split(" ")[0]}
                  >
                    {t.cta.chooseProgram}
                    <ArrowRight size={15} />
                  </BookButton>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-6 flex items-start gap-3 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[rgba(255,255,255,0.02)] p-4 text-[0.8rem] leading-relaxed text-[var(--color-faint)]">
            <Shield size={15} className="mt-0.5 shrink-0 text-[var(--color-accent-soft)]" />
            <span>{t.programs.honestNote}</span>
          </p>
        </div>
      </section>

      {/* comparison */}
      <section className="section-tight border-t border-[var(--color-line)] bg-[var(--color-ink-2)]">
        <div className="container-page">
          <h2 className="display display-m">{t.programs.compareTitle}</h2>
          <p className="mt-3 max-w-[44rem] text-[0.85rem] leading-relaxed text-[var(--color-muted)]">
            {t.programs.compareNote}
          </p>

          <div className="mt-8 overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--color-line)]">
            <table className="admin-table min-w-[720px]">
              <caption className="sr-only">{t.programs.compareTitle}</caption>
              <thead>
                <tr>
                  <th scope="col">{t.programs.tableProgram}</th>
                  <th scope="col">{t.programs.theory}</th>
                  <th scope="col">{t.programs.practice}</th>
                  <th scope="col">{t.programs.duration}</th>
                  <th scope="col">{t.programs.priceLabel}</th>
                  <th scope="col">
                    <span className="sr-only">{t.cta.chooseProgram}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {programs.map((program) => (
                  <tr key={program.slug}>
                    <th scope="row" className="text-left font-medium">
                      <span className="block text-[var(--color-text)]">{program.title}</span>
                      <span className="mt-1 block text-[0.72rem] font-normal text-[var(--color-faint)]">
                        {program.category}
                      </span>
                    </th>
                    <td className="text-[var(--color-muted)]">✓</td>
                    <td className="text-[var(--color-muted)]">✓</td>
                    <td className="text-[var(--color-muted)]">
                      {program.duration ?? t.ui.toBeConfirmed}
                    </td>
                    <td className="text-[var(--color-muted)]">
                      {priceLabel(program.price) ?? t.ui.onRequest}
                    </td>
                    <td>
                      <BookButton
                        className="btn btn-ghost btn-sm"
                        intent="price"
                        program={program.category.split(" ")[0]}
                      >
                        {t.cta.learnPrice}
                      </BookButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="pb-20 pt-14">
        <div className="container-page flex flex-col items-start justify-between gap-6 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] p-7 sm:flex-row sm:items-center sm:p-9">
          <div>
            <h2 className="display-m">{t.home.final.title}</h2>
            <p className="mt-2 max-w-[30rem] text-[0.9rem] text-[var(--color-muted)]">
              {t.home.final.lead}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <BookButton className="btn btn-primary" intent="consult">
              {t.cta.consult}
            </BookButton>
            <Link href={`/${locale}/contacts`} className="btn btn-ghost">
              {t.nav.contacts}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
