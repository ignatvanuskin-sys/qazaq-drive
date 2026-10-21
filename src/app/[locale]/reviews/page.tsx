import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { reviews, reviewMeta } from "@/content/reviews";
import { PageHero } from "@/components/PageHero";
import { BookButton } from "@/components/booking/BookButton";
import { ArrowUpRight, Check, Star } from "@/components/Icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale === "kz" ? "kz" : "ru", "reviews");
}

export default async function ReviewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);

  return (
    <>
      <PageHero
        eyebrow={t.reviews.title}
        title={t.reviews.h1}
        lead={t.reviews.lead}
        locale={locale}
        breadcrumb={[{ label: t.nav.reviews }]}
      >
        <div className="mt-9 grid gap-3 sm:grid-cols-3">
          <div className="card p-5">
            <p className="eyebrow">{t.reviews.ratingLabel}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[2rem] font-bold leading-none tabular">
                {reviewMeta.rating.toFixed(1)}
              </span>
              <span className="flex gap-0.5 text-[var(--color-accent)]" aria-hidden>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={12} />
                ))}
              </span>
            </div>
            <a
              href={reviewMeta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[0.78rem] text-[var(--color-muted)] hover:text-[var(--color-text)]"
            >
              {reviewMeta.source} <ArrowUpRight size={12} />
            </a>
          </div>
          <div className="card p-5">
            <p className="eyebrow">{t.ui.ratings}</p>
            <p className="mt-2 text-[2rem] font-bold leading-none tabular">{reviewMeta.ratings}</p>
            <p className="mt-2 text-[0.78rem] text-[var(--color-muted)]">
              {t.reviews.basedOn} {reviewMeta.source}
            </p>
          </div>
          <div className="card p-5">
            <p className="eyebrow">{t.ui.reviews}</p>
            <p className="mt-2 text-[2rem] font-bold leading-none tabular">{reviewMeta.reviews}</p>
            <p className="mt-2 text-[0.78rem] text-[var(--color-muted)]">
              {reviewMeta.checkedAt}
            </p>
          </div>
        </div>
      </PageHero>

      <section className="section-tight">
        <div className="container-page">
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
            {reviews.map((review) => (
              <figure
                key={review.author}
                className="card break-inside-avoid p-5 sm:p-6"
                data-reveal
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex gap-0.5 text-[var(--color-accent)]" aria-label={`${review.rating}/5`}>
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} size={11} />
                    ))}
                  </span>
                  <span className="text-[0.68rem] text-[var(--color-faint)]">{review.date}</span>
                </div>
                <blockquote className="mt-3 text-[0.9rem] leading-relaxed text-[var(--color-muted)]">
                  {review.text}
                </blockquote>
                <figcaption className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--color-line)] pt-3.5">
                  <div>
                    <span className="block text-[0.85rem] font-semibold">{review.author}</span>
                    {review.verified ? (
                      <span className="mt-1 inline-flex items-center gap-1 text-[0.68rem] text-[var(--color-faint)]">
                        <Check size={10} className="text-[var(--color-accent)]" />
                        {t.reviews.verifiedNote}
                      </span>
                    ) : null}
                  </div>
                  <a
                    href={reviewMeta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[0.72rem] text-[var(--color-faint)] hover:text-[var(--color-text)]"
                  >
                    {t.reviews.openSource}
                    <ArrowUpRight size={12} />
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] p-7 sm:flex-row sm:items-center">
            <p className="max-w-[38rem] text-[0.82rem] leading-relaxed text-[var(--color-faint)]">
              {t.reviews.honesty}
            </p>
            <BookButton className="btn btn-primary shrink-0" intent="start">
              {t.reviews.leaveRequest}
            </BookButton>
          </div>
        </div>
      </section>
    </>
  );
}
