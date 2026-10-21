import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { media } from "@/content/media";
import { PageHero } from "@/components/PageHero";
import { BookButton } from "@/components/booking/BookButton";
import { ArrowRight } from "@/components/Icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale === "kz" ? "kz" : "ru", "process");
}

export default async function ProcessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const kz = locale === "kz";

  const images = [media.city, media.theory, media.practice];

  return (
    <>
      <PageHero
        eyebrow={t.process.title}
        title={t.process.h1}
        lead={t.process.lead}
        locale={locale}
        breadcrumb={[{ label: t.nav.process }]}
      />

      <section className="section-tight">
        <div className="container-page">
          <ol className="relative border-l border-[var(--color-line)] pl-6 sm:pl-10">
            {t.process.steps.map((step, i) => {
              const image = images[i - 1];
              return (
                <li key={step.title} className="relative pb-12 last:pb-0" data-reveal>
                  <span
                    aria-hidden
                    className="absolute -left-[calc(1.5rem+5px)] top-1.5 flex size-2.5 items-center justify-center rounded-full border border-[var(--color-accent)] bg-[var(--color-ink)] sm:-left-[calc(2.5rem+5px)]"
                  />
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                    <div className="max-w-[38rem]">
                      <span className="text-[0.72rem] font-semibold tabular text-[var(--color-accent)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h2 className="mt-2 text-[1.2rem] font-semibold leading-snug sm:text-[1.35rem]">
                        {step.title}
                      </h2>
                      <p className="mt-2.5 text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
                        {step.text}
                      </p>
                      {image ? (
                        <div className="mt-6 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-line)]">
                          <Image
                            src={image.src}
                            alt={kz ? image.altKz : image.altRu}
                            width={image.width}
                            height={image.height}
                            sizes="(max-width: 1024px) 100vw, 600px"
                            className="aspect-[16/8] w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] p-7 sm:flex-row sm:items-center sm:p-9">
            <div>
              <h2 className="display-m">{t.process.ctaTitle}</h2>
              <p className="mt-2 max-w-[30rem] text-[0.9rem] text-[var(--color-muted)]">
                {t.process.ctaLead}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <BookButton className="btn btn-primary">
                {t.cta.book}
                <ArrowRight size={16} />
              </BookButton>
              <Link href={`/${locale}/faq`} className="btn btn-ghost">
                {t.process.faqLink}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
