import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { brand } from "@/content/brand";
import { media } from "@/content/media";
import { reviews, reviewMeta } from "@/content/reviews";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";
import { getFaq, getInstructors, getPrograms } from "@/lib/content";
import { getConfig } from "@/lib/settings";
import { BookButton } from "@/components/booking/BookButton";
import { FaqAccordion } from "@/components/FaqAccordion";
import { ArrowRight, ArrowUpRight, Check, Phone, Star, WhatsApp } from "@/components/Icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale === "kz" ? "kz" : "ru", "home");
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const config = await getConfig();
  const [programs, faq, instructors] = await Promise.all([
    getPrograms(locale),
    getFaq(locale),
    getInstructors(),
  ]);
  const kz = locale === "kz";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(locale)) }}
      />

      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="grid-texture pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-70" />
        <div className="container-page relative">
          <div className="grid items-center gap-10 pt-8 sm:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pt-14">
            <div className="lg:pb-16">
              <p className="rule-label eyebrow">
                <span>{t.home.eyebrow}</span>
              </p>
              <h1 className="display display-xl mt-6">
                <span className="block">{t.home.h1a}</span>
                <span className="serif-accent mt-1 block text-[var(--color-accent-soft)]">
                  {t.home.h1b}
                </span>
              </h1>
              <p className="lead mt-6 max-w-[33rem]">{t.home.lead}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <BookButton className="btn btn-primary w-full sm:w-auto">
                  {t.cta.book}
                  <ArrowRight size={17} />
                </BookButton>
                <Link href={`/${locale}/programs`} className="btn btn-ghost w-full sm:w-auto">
                  {t.cta.chooseProgram}
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex gap-0.5 text-[var(--color-accent)]" aria-hidden>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} size={13} />
                    ))}
                  </span>
                  <span className="text-[0.82rem] text-[var(--color-muted)]">
                    <strong className="font-semibold text-[var(--color-text)]">
                      {reviewMeta.rating.toFixed(1)}
                    </strong>{" "}
                    — {reviewMeta.ratings} {t.ui.ratings}{" "}
                    <span className="text-[var(--color-faint)]">·</span>{" "}
                    <a
                      href={brand.links.gis2Reviews}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline text-[var(--color-muted)]"
                    >
                      2GIS
                    </a>
                  </span>
                </div>
                <span className="hidden h-3 w-px bg-[var(--color-line-strong)] sm:block" aria-hidden />
                <span className="text-[0.82rem] text-[var(--color-muted)]">
                  {brand.categories.length} {t.home.stats.categories} · A–D1E
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="hero-photo aspect-[5/4] sm:aspect-[16/10] lg:aspect-[4/5]">
                <Image
                  src={media.hero.src}
                  alt={kz ? media.hero.altKz : media.hero.altRu}
                  width={media.hero.width}
                  height={media.hero.height}
                  priority
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  className="img-cover"
                />
              </div>
              <div className="absolute bottom-4 left-4 hidden rounded-full border border-[rgba(255,255,255,0.14)] bg-[rgba(8,9,10,0.6)] px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.12em] text-[var(--color-muted)] backdrop-blur-sm sm:block">
                {kz ? media.hero.captionKz : media.hero.captionRu}
              </div>
            </div>
          </div>

          {/* stat strip */}
          <dl className="grid grid-cols-2 gap-y-7 border-t border-[var(--color-line)] py-8 sm:grid-cols-4 sm:gap-x-6">
            {[
              { value: reviewMeta.rating.toFixed(1), label: t.home.stats.rating },
              { value: String(reviewMeta.reviews), label: t.home.stats.reviews },
              { value: String(brand.categories.length), label: t.home.stats.categories },
              { value: String(brand.branchCount), label: t.home.stats.branches },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block text-[1.9rem] font-bold leading-none tracking-[-0.03em] tabular sm:text-[2.15rem]">
                    {stat.value}
                  </span>
                  <span className="mt-2 block text-[0.76rem] leading-snug text-[var(--color-faint)]">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------------ QUOTE BAND */}
      <section className="border-y border-[var(--color-line)] bg-[var(--color-ink-2)]">
        <div className="container-page flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
          <blockquote className="max-w-[52rem]">
            <p className="serif-accent text-[1.35rem] leading-snug text-[var(--color-text)] sm:text-[1.6rem]">
              «{kz ? brand.ownerClaimKz : brand.ownerClaimRu}»
            </p>
            <footer className="mt-2 text-[0.72rem] uppercase tracking-[0.14em] text-[var(--color-faint)]">
              {t.home.quoteLabel} ·{" "}
              <a
                href={brand.links.gis2}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-muted)]"
              >
                2GIS
              </a>
            </footer>
          </blockquote>
          <a
            href={brand.links.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm shrink-0"
          >
            <WhatsApp size={15} />
            {t.cta.whatsapp}
          </a>
        </div>
      </section>

      {/* ---------------------------------------------------------------- ABOUT */}
      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div data-reveal>
            <p className="eyebrow">{t.home.about.eyebrow}</p>
            <h2 className="display display-l mt-5 max-w-[22rem]">{t.home.about.title}</h2>
          </div>
          <div data-reveal>
            <p className="text-[1.02rem] leading-relaxed text-[var(--color-muted)] sm:text-[1.1rem]">
              {t.home.about.body}
            </p>
            <ul className="mt-8 grid gap-3.5">
              {t.home.about.points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-[rgba(207,133,81,0.35)] text-[var(--color-accent-soft)]">
                    <Check size={11} />
                  </span>
                  <span className="text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              <div className="relative overflow-hidden rounded-[var(--radius-sm)]">
                <Image
                  src={media.practice.src}
                  alt={kz ? media.practice.altKz : media.practice.altRu}
                  width={media.practice.width}
                  height={media.practice.height}
                  sizes="(max-width: 640px) 100vw, 300px"
                  className="aspect-[16/10] w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="relative overflow-hidden rounded-[var(--radius-sm)]">
                <Image
                  src={media.theory.src}
                  alt={kz ? media.theory.altKz : media.theory.altRu}
                  width={media.theory.width}
                  height={media.theory.height}
                  sizes="(max-width: 640px) 100vw, 300px"
                  className="aspect-[16/10] w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- PROGRAMS */}
      <section className="section-tight border-t border-[var(--color-line)]">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end" data-reveal>
            <div>
              <p className="eyebrow">{t.home.programs.eyebrow}</p>
              <h2 className="display display-l mt-4">{t.home.programs.title}</h2>
            </div>
            <p className="lead max-w-[30rem] text-[0.95rem]">{t.home.programs.lead}</p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {programs.map((program, i) => (
              <article
                key={program.slug}
                className="card card-hover flex flex-col p-5 sm:p-6"
                data-reveal
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="chip chip-accent">{program.category}</span>
                  <span className="text-[0.68rem] uppercase tracking-[0.12em] text-[var(--color-faint)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 text-[1.08rem] font-semibold leading-snug">{program.title}</h3>
                <p className="mt-3 flex-1 text-[0.85rem] leading-relaxed text-[var(--color-muted)]">
                  {program.summary}
                </p>

                <dl className="mt-5 space-y-2 border-t border-[var(--color-line)] pt-4 text-[0.8rem]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--color-faint)]">{t.programs.duration}</dt>
                    <dd className="text-right text-[var(--color-muted)]">
                      {program.duration ?? t.ui.toBeConfirmed}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--color-faint)]">{t.programs.priceLabel}</dt>
                    <dd className="text-right font-medium">
                      {program.price ? (
                        `${program.price.toLocaleString("ru-RU")} ₸`
                      ) : (
                        <span className="text-[var(--color-accent-soft)]">{t.ui.onRequest}</span>
                      )}
                    </dd>
                  </div>
                </dl>

                <BookButton
                  className="btn btn-ghost btn-sm mt-5 w-full"
                  intent="price"
                  program={program.category.split(" ")[0]}
                >
                  {t.cta.learnPrice}
                </BookButton>
              </article>
            ))}
          </div>

          <p className="mt-6 max-w-[46rem] text-[0.78rem] leading-relaxed text-[var(--color-faint)]">
            {t.home.programs.note}
          </p>
        </div>
      </section>

      {/* -------------------------------------------------------------- PROCESS */}
      <section className="section border-t border-[var(--color-line)] bg-[var(--color-ink-2)]">
        <div className="container-page">
          <div className="max-w-[40rem]" data-reveal>
            <p className="eyebrow">{t.home.process.eyebrow}</p>
            <h2 className="display display-l mt-4">{t.home.process.title}</h2>
            <p className="lead mt-4">{t.home.process.lead}</p>
          </div>

          <ol className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {t.process.steps.map((step, i) => (
              <li key={step.title} className="relative" data-reveal style={{ transitionDelay: `${i * 50}ms` }}>
                <div className="flex items-baseline gap-4">
                  <span className="text-[0.72rem] font-semibold tabular text-[var(--color-accent)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px flex-1 bg-[var(--color-line)]" aria-hidden />
                </div>
                <h3 className="mt-4 text-[1.02rem] font-semibold">{step.title}</h3>
                <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--color-muted)]">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link href={`/${locale}/process`} className="btn btn-ghost btn-sm">
              {t.home.process.more}
              <ArrowRight size={15} />
            </Link>
            <BookButton className="btn btn-primary btn-sm" intent="start">
              {t.cta.book}
            </BookButton>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- FLEET */}
      <section className="relative overflow-hidden">
        <div className="relative h-[420px] w-full sm:h-[520px]">
          <Image
            src={media.fleet.src}
            alt={kz ? media.fleet.altKz : media.fleet.altRu}
            width={media.fleet.width}
            height={media.fleet.height}
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,7,8,0.92)_0%,rgba(6,7,8,0.62)_45%,rgba(6,7,8,0.25)_100%)]" />
          <div className="container-page relative flex h-full items-end pb-10 sm:items-center sm:pb-0">
            <div className="max-w-[30rem]" data-reveal>
              <p className="eyebrow">{t.home.fleet.eyebrow}</p>
              <h2 className="display display-m mt-4">{t.home.fleet.title}</h2>
              <p className="mt-4 text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
                {t.home.fleet.lead}
              </p>
              <Link href={`/${locale}/fleet`} className="btn btn-ghost btn-sm mt-6">
                {t.cta.details}
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- INSTRUCTORS */}
      <section className="section-tight">
        <div className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-20">
          <div data-reveal>
            <p className="eyebrow">{t.home.instructors.eyebrow}</p>
            <h2 className="display display-l mt-4 max-w-[20rem]">{t.home.instructors.title}</h2>
          </div>
          <div data-reveal>
            <p className="lead">{t.home.instructors.lead}</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {instructors.length > 0
                ? instructors.slice(0, 4).map((person) => (
                    <div key={person.id} className="card flex items-center gap-4 p-4">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-line)] text-sm font-semibold text-[var(--color-muted)]">
                        {person.name.slice(0, 1)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[0.9rem] font-semibold">{person.name}</p>
                        <p className="truncate text-[0.76rem] text-[var(--color-faint)]">
                          {(kz ? person.roleKz : person.roleRu) ?? t.instructors.placeholderRole}
                        </p>
                      </div>
                    </div>
                  ))
                : [0, 1].map((i) => (
                    <div
                      key={i}
                      className="rounded-[var(--radius-sm)] border border-dashed border-[var(--color-line)] p-4"
                    >
                      <div className="h-2.5 w-24 rounded-full bg-[rgba(255,255,255,0.08)]" />
                      <div className="mt-2.5 h-2 w-16 rounded-full bg-[rgba(255,255,255,0.05)]" />
                      <p className="mt-3 text-[0.72rem] text-[var(--color-faint)]">
                        {kz ? "Профиль толтырылуда" : "Профиль заполняется"}
                      </p>
                    </div>
                  ))}
            </div>
            <p className="mt-5 text-[0.78rem] leading-relaxed text-[var(--color-faint)]">
              {t.home.instructors.note}
            </p>
            <Link href={`/${locale}/instructors`} className="btn btn-quiet btn-sm mt-4 px-0">
              {t.nav.instructors}
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- REVIEWS */}
      <section className="section border-t border-[var(--color-line)] bg-[var(--color-ink-2)]">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end" data-reveal>
            <div>
              <p className="eyebrow">{t.home.reviews.eyebrow}</p>
              <h2 className="display display-l mt-4">{t.home.reviews.title}</h2>
            </div>
            <div className="flex items-center gap-4 rounded-full border border-[var(--color-line)] px-4 py-2.5">
              <span className="flex gap-0.5 text-[var(--color-accent)]" aria-hidden>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={12} />
                ))}
              </span>
              <span className="text-[0.8rem] text-[var(--color-muted)]">
                <strong className="text-[var(--color-text)]">{reviewMeta.rating.toFixed(1)}</strong> ·{" "}
                {reviewMeta.ratings} {t.ui.ratings} · {reviewMeta.source}
              </span>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {reviews.slice(0, 3).map((review, i) => (
              <figure
                key={review.author}
                className="card flex flex-col p-6"
                data-reveal
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <span className="serif-accent text-[1.5rem] leading-none text-[var(--color-accent)]" aria-hidden>
                  “
                </span>
                <blockquote className="mt-2 flex-1 text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
                  {review.text.length > 210 ? `${review.text.slice(0, 210).trim()}…` : review.text}
                </blockquote>
                <figcaption className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--color-line)] pt-4">
                  <div>
                    <span className="block text-[0.85rem] font-semibold">{review.author}</span>
                    <span className="block text-[0.7rem] text-[var(--color-faint)]">{review.date}</span>
                  </div>
                  <a
                    href={reviewMeta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${review.author} — 2GIS`}
                    className="text-[var(--color-faint)] transition-colors hover:text-[var(--color-text)]"
                  >
                    <ArrowUpRight size={15} />
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={reviewMeta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
            >
              {t.cta.openReviews}
              <ArrowUpRight size={14} />
            </a>
            <BookButton className="btn btn-primary btn-sm" intent="start">
              {t.home.reviews.cta}
            </BookButton>
          </div>
          <p className="mt-4 max-w-[46rem] text-[0.76rem] leading-relaxed text-[var(--color-faint)]">
            {t.reviews.honesty}
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ FAQ */}
      <section className="section-tight">
        <div className="container-page grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div data-reveal>
            <p className="eyebrow">{t.home.faq.eyebrow}</p>
            <h2 className="display display-l mt-4 max-w-[16rem]">{t.home.faq.title}</h2>
            <Link href={`/${locale}/faq`} className="btn btn-quiet btn-sm mt-5 px-0">
              {t.home.faq.all}
              <ArrowRight size={15} />
            </Link>
          </div>
          <div data-reveal>
            <FaqAccordion items={faq.slice(0, 5)} t={t} idPrefix="home-faq" />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ FINAL CTA */}
      <section id="book" className="pb-16 sm:pb-24">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div aria-hidden className="grid-texture absolute inset-0 opacity-50" />
            <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:p-14">
              <div data-reveal>
                <p className="eyebrow">{t.home.final.eyebrow}</p>
                <h2 className="display display-l mt-4 max-w-[24rem]">{t.home.final.title}</h2>
                <p className="lead mt-4 max-w-[30rem]">{t.home.final.lead}</p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <BookButton className="btn btn-primary w-full sm:w-auto">
                    {t.cta.book}
                    <ArrowRight size={16} />
                  </BookButton>
                  <a
                    href={brand.links.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost w-full sm:w-auto"
                  >
                    <WhatsApp size={16} />
                    {t.cta.whatsapp}
                  </a>
                </div>
              </div>

              <div className="grid content-start gap-5 sm:grid-cols-2 lg:grid-cols-1" data-reveal>
                <div>
                  <p className="eyebrow">{t.contacts.address}</p>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--color-muted)]">
                    {config.addressLine1}
                    <br />
                    {config.addressLine2}, {config.city}
                  </p>
                </div>
                <div>
                  <p className="eyebrow">{t.contacts.phone}</p>
                  <a
                    href={`tel:${config.phoneRaw}`}
                    className="mt-2 flex items-center gap-2 text-[1rem] font-semibold tabular hover:text-[var(--color-accent-soft)]"
                  >
                    <Phone size={15} className="text-[var(--color-accent)]" />
                    {config.phone}
                  </a>
                  <p className="mt-2 text-[0.8rem] text-[var(--color-faint)]">
                    {config.opensAt} · {kz ? config.hoursNoteKz : config.hoursNoteRu}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
