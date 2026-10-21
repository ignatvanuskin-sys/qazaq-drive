import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { brand } from "@/content/brand";
import { getConfig } from "@/lib/settings";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { Phone, Shield, WhatsApp } from "@/components/Icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale === "kz" ? "kz" : "ru", "booking");
}

export default async function BookingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const config = await getConfig();

  return (
    <section className="section-tight">
      <div className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <p className="eyebrow">{t.booking.title}</p>
          <h1 className="display display-l mt-4">{t.booking.h1}</h1>
          <p className="lead mt-4 max-w-[26rem]">{t.booking.lead}</p>

          <ol className="mt-8 space-y-3">
            {t.booking.steps.map((step, i) => (
              <li key={step} className="flex items-center gap-3 text-[0.88rem]">
                <span className="flex size-6 items-center justify-center rounded-full border border-[var(--color-line)] text-[0.68rem] tabular text-[var(--color-muted)]">
                  {i + 1}
                </span>
                <span className="text-[var(--color-muted)]">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-9 space-y-3 border-t border-[var(--color-line)] pt-6">
            <a
              href={`tel:${config.phoneRaw}`}
              className="flex items-center gap-3 text-[0.9rem] text-[var(--color-muted)] hover:text-[var(--color-text)]"
            >
              <Phone size={16} className="text-[var(--color-accent)]" />
              <span className="tabular">{config.phone}</span>
            </a>
            <a
              href={`https://wa.me/${config.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-[0.9rem] text-[var(--color-muted)] hover:text-[var(--color-text)]"
            >
              <WhatsApp size={16} className="text-[var(--color-accent)]" />
              WhatsApp
            </a>
            <p className="flex items-start gap-3 pt-2 text-[0.75rem] leading-relaxed text-[var(--color-faint)]">
              <Shield size={14} className="mt-0.5 shrink-0 text-[var(--color-accent-soft)]" />
              {t.booking.summaryNote}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)]">
          <BookingWizard locale={locale} t={t} compact />
        </div>
      </div>
    </section>
  );
}
