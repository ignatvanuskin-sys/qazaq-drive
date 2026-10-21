import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { getFaq } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { FaqAccordion } from "@/components/FaqAccordion";
import { BookButton } from "@/components/booking/BookButton";
import { brand } from "@/content/brand";
import { getConfig } from "@/lib/settings";
import { Phone, WhatsApp } from "@/components/Icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale === "kz" ? "kz" : "ru", "faq");
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const faq = await getFaq(locale);
  const config = await getConfig();

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq
      .filter((item) => !item.pending)
      .map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <PageHero
        eyebrow={t.faq.title}
        title={t.faq.h1}
        lead={t.faq.lead}
        locale={locale}
        breadcrumb={[{ label: t.nav.faq }]}
      />

      <section className="section-tight">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_0.55fr] lg:gap-16">
          <div>
            <FaqAccordion items={faq} t={t} idPrefix="faq-page" />
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="card p-6">
              <h2 className="text-[1rem] font-semibold">{t.home.final.title}</h2>
              <p className="mt-2 text-[0.85rem] leading-relaxed text-[var(--color-muted)]">
                {t.home.final.lead}
              </p>
              <div className="mt-5 grid gap-2.5">
                <BookButton className="btn btn-primary btn-sm w-full" intent="consult">
                  {t.cta.consult}
                </BookButton>
                <a
                  href={brand.links.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm w-full"
                >
                  <WhatsApp size={15} />
                  {t.cta.whatsapp}
                </a>
                <a
                  href={`tel:${config.phoneRaw}`}
                  className="btn btn-quiet btn-sm w-full tabular"
                >
                  <Phone size={15} />
                  {config.phone}
                </a>
              </div>
              <p className="mt-4 border-t border-[var(--color-line)] pt-4 text-[0.72rem] leading-relaxed text-[var(--color-faint)]">
                {t.ui.licenceNote}.{" "}
                <Link href={`/${locale}/contacts`} className="link-underline">
                  {t.nav.contacts}
                </Link>
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
