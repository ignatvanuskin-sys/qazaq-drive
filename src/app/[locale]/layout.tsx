import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { BookingProvider } from "@/components/booking/context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { MobileBookBar } from "@/components/MobileBookBar";
import { RevealObserver } from "@/components/RevealObserver";
import { SourceTracker } from "@/components/SourceTracker";
import { HtmlLang } from "@/components/HtmlLang";
import { brand } from "@/content/brand";
import { getConfig } from "@/lib/settings";
import { siteUrl } from "@/lib/seo";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  other: { "content-language": "ru, kk" },
  openGraph: { images: [`${siteUrl}/og/cover.jpg`] },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const config = await getConfig();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: brand.name,
    url: `${siteUrl}/${locale}`,
    inLanguage: locale === "ru" ? "ru-KZ" : "kk-KZ",
  };

  return (
    <BookingProvider
      locale={locale}
      t={t}
      whatsapp={config.whatsapp}
      common={{ close: t.cta.close, whatsapp: t.cta.whatsapp }}
    >
      <HtmlLang locale={locale} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--color-accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--color-accent-ink)]"
      >
        {t.ui.skipToContent}
      </a>
      <Header locale={locale} t={t} phone={config.phone} phoneRaw={config.phoneRaw} />
      <main id="main" className="pb-24 sm:pb-0">
        {children}
      </main>
      <Footer locale={locale} t={t} config={config} />
      <ChatWidget locale={locale} t={t} />
      <MobileBookBar label={t.cta.book} />
      <RevealObserver />
      <SourceTracker locale={locale} />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </BookingProvider>
  );
}
