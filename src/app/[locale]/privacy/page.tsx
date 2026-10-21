import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { brand } from "@/content/brand";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale === "kz" ? "kz" : "ru", "privacy");
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);

  return (
    <>
      <PageHero
        eyebrow={t.footer.legal}
        title={t.privacy.h1}
        lead={t.privacy.lead}
        locale={locale}
        breadcrumb={[{ label: t.footer.privacy }]}
      >
        <p className="mt-5 text-[0.75rem] text-[var(--color-faint)]">
          {t.privacy.updated}: {brand.rating.checkedAt}
        </p>
      </PageHero>

      <section className="section-tight">
        <div className="container-page grid max-w-[52rem] gap-8">
          {t.privacy.sections.map((section, i) => (
            <article key={section.title} data-reveal>
              <h2 className="flex items-baseline gap-3 text-[1.05rem] font-semibold">
                <span className="text-[0.7rem] tabular text-[var(--color-accent)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {section.title}
              </h2>
              <p className="mt-2.5 pl-8 text-[0.9rem] leading-relaxed text-[var(--color-muted)]">
                {section.text}
              </p>
            </article>
          ))}

          <div className="rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[rgba(255,255,255,0.02)] p-5 text-[0.82rem] leading-relaxed text-[var(--color-muted)]">
            <p>
              {locale === "kz" ? "Байланыс:" : "Контакт по вопросам данных:"}{" "}
              <a href={brand.links.email} className="link-underline">
                {brand.contact.email}
              </a>
              , <span className="tabular">{brand.contact.phone}</span>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
