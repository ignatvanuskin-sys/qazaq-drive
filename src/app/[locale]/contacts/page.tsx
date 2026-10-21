import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { brand } from "@/content/brand";
import { getConfig } from "@/lib/settings";
import { PageHero } from "@/components/PageHero";
import { MapEmbed } from "@/components/MapEmbed";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { Instagram, Mail, MapPin, Phone, Route, WhatsApp } from "@/components/Icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale === "kz" ? "kz" : "ru", "contacts");
}

export default async function ContactsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const config = await getConfig();
  const l = (ru: string, kz: string) => (locale === "kz" ? kz : ru);
  const kz = locale === "kz";

  return (
    <>
      <PageHero
        eyebrow={t.contacts.title}
        title={t.contacts.h1}
        lead={t.contacts.lead}
        locale={locale}
        breadcrumb={[{ label: t.nav.contacts }]}
      />

      <section className="section-tight">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div>
            <dl className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
              <div className="flex gap-4 py-5">
                <MapPin size={17} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
                <div>
                  <dt className="eyebrow">{t.contacts.address}</dt>
                  <dd className="mt-1.5 text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
                    {config.addressLine1}
                    <br />
                    {config.addressLine2}
                    <br />
                    {config.city}, {config.postalCode}
                  </dd>
                </div>
              </div>

              <div className="flex gap-4 py-5">
                <Phone size={17} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
                <div>
                  <dt className="eyebrow">{t.contacts.phone}</dt>
                  <dd className="mt-1.5">
                    <a
                      href={`tel:${config.phoneRaw}`}
                      className="text-[0.95rem] font-medium tabular hover:text-[var(--color-accent-soft)]"
                    >
                      {config.phone}
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex gap-4 py-5">
                <WhatsApp size={17} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
                <div>
                  <dt className="eyebrow">{t.contacts.whatsapp}</dt>
                  <dd className="mt-1.5">
                    <a
                      href={brand.links.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.92rem] text-[var(--color-muted)] hover:text-[var(--color-text)]"
                    >
                      +{config.whatsapp}
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex gap-4 py-5">
                <Mail size={17} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
                <div>
                  <dt className="eyebrow">{t.contacts.email}</dt>
                  <dd className="mt-1.5">
                    <a
                      href={`mailto:${config.email}`}
                      className="break-all text-[0.92rem] text-[var(--color-muted)] hover:text-[var(--color-text)]"
                    >
                      {config.email}
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex gap-4 py-5">
                <Instagram size={17} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
                <div>
                  <dt className="eyebrow">{t.contacts.social}</dt>
                  <dd className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.92rem]">
                    <a
                      href={brand.links.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
                    >
                      Instagram
                    </a>
                    <a
                      href={brand.links.gis2}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
                    >
                      2GIS
                    </a>
                    <a
                      href={brand.links.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
                    >
                      TikTok
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex gap-4 py-5">
                <Route size={17} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
                <div>
                  <dt className="eyebrow">{t.contacts.hours}</dt>
                  <dd className="mt-1.5 text-[0.88rem] leading-relaxed text-[var(--color-muted)]">
                    {l("Открытие в", "Ашылуы")} {config.opensAt}. {kz ? config.hoursNoteKz : config.hoursNoteRu}
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <a href={`tel:${config.phoneRaw}`} className="btn btn-ghost btn-sm">
                <Phone size={15} />
                {t.cta.call}
              </a>
              <a
                href={brand.links.gis2Route}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
              >
                <Route size={15} />
                {t.cta.route}
              </a>
            </div>

            <p className="mt-6 text-[0.76rem] leading-relaxed text-[var(--color-faint)]">
              {t.contacts.branchesNote}
            </p>
          </div>

          <div>
            <MapEmbed
              title={t.contacts.map}
              label={t.contacts.map}
              note={t.contacts.mapNote}
              openLabel={t.contacts.openMap}
              routeLabel={t.cta.route}
              address={`${config.addressLine1}, ${config.city}`}
            />

            <div className="mt-6 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)]">
              <div className="border-b border-[var(--color-line)] px-5 py-4">
                <h2 className="text-[1rem] font-semibold">{t.contacts.formTitle}</h2>
                <p className="mt-1 text-[0.8rem] text-[var(--color-muted)]">{t.contacts.formLead}</p>
              </div>
              <BookingWizard locale={locale} t={t} initialIntent="consult" compact />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
