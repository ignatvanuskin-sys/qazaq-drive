import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { getInstructors } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { BookButton } from "@/components/booking/BookButton";
import { Shield } from "@/components/Icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale === "kz" ? "kz" : "ru", "instructors");
}

export default async function InstructorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const kz = locale === "kz";
  const instructors = await getInstructors();

  return (
    <>
      <PageHero
        eyebrow={t.instructors.title}
        title={t.instructors.h1}
        lead={t.instructors.lead}
        locale={locale}
        breadcrumb={[{ label: t.nav.instructors }]}
      />

      <section className="section-tight">
        <div className="container-page">
          {instructors.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {instructors.map((person) => (
                <article key={person.id} className="card overflow-hidden">
                  <div className="relative aspect-[4/3] bg-[var(--color-surface-2)]">
                    {person.photoUrl ? (
                      <Image
                        src={person.photoUrl}
                        alt={person.name}
                        width={640}
                        height={480}
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="img-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl font-semibold text-[var(--color-faint)]">
                        {person.name.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h2 className="text-[1.05rem] font-semibold">{person.name}</h2>
                    <p className="mt-0.5 text-[0.8rem] text-[var(--color-faint)]">
                      {(kz ? person.roleKz : person.roleRu) ?? t.instructors.placeholderRole}
                    </p>
                    <dl className="mt-4 space-y-1.5 text-[0.8rem]">
                      {person.experience ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-[var(--color-faint)]">{t.instructors.experience}</dt>
                          <dd className="text-right text-[var(--color-muted)]">{person.experience}</dd>
                        </div>
                      ) : null}
                      {person.languages ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-[var(--color-faint)]">{t.instructors.languages}</dt>
                          <dd className="text-right text-[var(--color-muted)]">{person.languages}</dd>
                        </div>
                      ) : null}
                      {person.specialties ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-[var(--color-faint)]">{t.instructors.specialty}</dt>
                          <dd className="text-right text-[var(--color-muted)]">{person.specialties}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-line-strong)] bg-[rgba(255,255,255,0.015)] p-7 sm:p-10">
              <div className="flex size-11 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-faint)]">
                <Shield size={20} />
              </div>
              <h2 className="mt-4 text-[1.05rem] font-semibold">{t.instructors.emptyTitle}</h2>
              <p className="mt-2 max-w-[44rem] text-[0.88rem] leading-relaxed text-[var(--color-muted)]">
                {t.instructors.emptyText}
              </p>
              <BookButton className="btn btn-ghost btn-sm mt-6" intent="consult">
                {t.cta.consult}
              </BookButton>
            </div>
          )}

          <p className="mt-8 flex max-w-[46rem] items-start gap-3 text-[0.78rem] leading-relaxed text-[var(--color-faint)]">
            <Shield size={14} className="mt-0.5 shrink-0 text-[var(--color-accent-soft)]" />
            {t.instructors.lead}
          </p>
        </div>
      </section>
    </>
  );
}
