import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { getVehicles } from "@/lib/content";
import { media, galleryItems } from "@/content/media";
import { PageHero } from "@/components/PageHero";
import { BookButton } from "@/components/booking/BookButton";
import { Gallery, type GalleryItem } from "@/components/Gallery";
import { Car, Check } from "@/components/Icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale === "kz" ? "kz" : "ru", "fleet");
}

export default async function FleetPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const kz = locale === "kz";
  const vehicles = await getVehicles();

  const gallery: GalleryItem[] = galleryItems.map((key) => {
    const item = media[key];
    return {
      src: item.src,
      alt: kz ? item.altKz : item.altRu,
      caption: kz ? item.captionKz : item.captionRu,
      width: item.width,
      height: item.height,
    };
  });

  return (
    <>
      <PageHero
        eyebrow={t.fleet.title}
        title={t.fleet.h1}
        lead={t.fleet.lead}
        locale={locale}
        breadcrumb={[{ label: t.nav.fleet }]}
      />

      <section className="section-tight">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-line)]" data-reveal>
            <Image
              src={media.practice.src}
              alt={kz ? media.practice.altKz : media.practice.altRu}
              width={media.practice.width}
              height={media.practice.height}
              sizes="(max-width: 1024px) 100vw, 620px"
              className="aspect-[4/3] w-full object-cover"
              priority
            />
          </div>
          <div data-reveal>
            <h2 className="display-m">{t.fleet.practiceTitle}</h2>
            <ul className="mt-6 grid gap-3">
              {t.fleet.practicePoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-[rgba(207,133,81,0.35)] text-[var(--color-accent-soft)]">
                    <Check size={11} />
                  </span>
                  <span className="text-[0.9rem] leading-relaxed text-[var(--color-muted)]">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
            <BookButton className="btn btn-primary btn-sm mt-7" intent="schedule">
              {t.cta.schedule}
            </BookButton>
          </div>
        </div>
      </section>

      <section className="section-tight border-t border-[var(--color-line)]">
        <div className="container-page">
          <h2 className="display-m">{t.fleet.galleryTitle}</h2>
          <p className="mt-2 text-[0.82rem] text-[var(--color-faint)]">{t.fleet.galleryNote}</p>

          {vehicles.length > 0 ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <article key={vehicle.id} className="card overflow-hidden">
                  {vehicle.photoUrl ? (
                    <Image
                      src={vehicle.photoUrl}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      width={720}
                      height={480}
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="aspect-[3/2] w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex aspect-[3/2] items-center justify-center bg-[var(--color-surface-2)] text-[var(--color-faint)]">
                      <Car size={28} />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-[1rem] font-semibold">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <dl className="mt-3 space-y-1.5 text-[0.8rem]">
                      <div className="flex justify-between gap-3">
                        <dt className="text-[var(--color-faint)]">{t.programs.transmission}</dt>
                        <dd className="text-[var(--color-muted)]">
                          {vehicle.transmission === "manual"
                            ? t.fleet.transmissionManual
                            : vehicle.transmission === "automatic"
                              ? t.fleet.transmissionAuto
                              : t.ui.toBeConfirmed}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-[var(--color-faint)]">{t.programs.category}</dt>
                        <dd className="text-[var(--color-muted)]">{vehicle.category ?? "—"}</dd>
                      </div>
                    </dl>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[var(--radius-md)] border border-dashed border-[var(--color-line-strong)] bg-[rgba(255,255,255,0.015)] p-7 sm:p-10">
              <div className="flex size-11 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-faint)]">
                <Car size={20} />
              </div>
              <h3 className="mt-4 text-[1.05rem] font-semibold">{t.fleet.emptyTitle}</h3>
              <p className="mt-2 max-w-[42rem] text-[0.88rem] leading-relaxed text-[var(--color-muted)]">
                {t.fleet.emptyText}
              </p>
              <BookButton className="btn btn-ghost btn-sm mt-6" intent="consult">
                {t.cta.consult}
              </BookButton>
            </div>
          )}

          <div className="mt-10">
            <Gallery items={gallery} closeLabel={t.cta.close} />
          </div>
        </div>
      </section>
    </>
  );
}
