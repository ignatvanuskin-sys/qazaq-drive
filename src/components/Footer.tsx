import Link from "next/link";
import { brand } from "@/content/brand";
import type { Dictionary } from "@/content/i18n/ru";
import type { Locale } from "@/lib/i18n";
import { Instagram, Mail, MapPin, Phone, Route, WhatsApp } from "@/components/Icons";
import type { PublicConfig } from "@/lib/settings";

export function Footer({ locale, t, config }: { locale: Locale; t: Dictionary; config: PublicConfig }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-ink-2)]">
      <div className="container-page py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span aria-hidden className="flex size-8 items-center justify-center rounded-[7px] border border-[var(--color-line-strong)]">
                <span className="block size-2.5 rotate-45 border border-[var(--color-accent)]" />
              </span>
              <span className="leading-none">
                <span className="block text-[0.95rem] font-extrabold tracking-[0.14em]">QAZAQ</span>
                <span className="mt-1 block text-[0.55rem] font-semibold tracking-[0.34em] text-[var(--color-muted)]">
                  DRIVE SCHOOL
                </span>
              </span>
            </div>
            <p className="mt-5 max-w-[26rem] text-[0.875rem] leading-relaxed text-[var(--color-muted)]">
              {t.footer.tagline}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={brand.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="chip transition-colors hover:border-[var(--color-line-strong)] hover:text-[var(--color-text)]"
              >
                <Instagram size={14} />
                Instagram
              </a>
              <a
                href={brand.links.gis2}
                target="_blank"
                rel="noopener noreferrer"
                className="chip transition-colors hover:border-[var(--color-line-strong)] hover:text-[var(--color-text)]"
              >
                2GIS
              </a>
              <a
                href={brand.links.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="chip transition-colors hover:border-[var(--color-line-strong)] hover:text-[var(--color-text)]"
              >
                <WhatsApp size={14} />
                WhatsApp
              </a>
            </div>
          </div>

          <nav aria-label="Footer">
            <h2 className="eyebrow">{t.footer.navigation}</h2>
            <ul className="mt-4 space-y-2.5 text-[0.875rem]">
              {[
                { href: "/programs", label: t.nav.programs },
                { href: "/process", label: t.nav.process },
                { href: "/fleet", label: t.nav.fleet },
                { href: "/instructors", label: t.nav.instructors },
                { href: "/reviews", label: t.nav.reviews },
                { href: "/faq", label: t.nav.faq },
                { href: "/contacts", label: t.nav.contacts },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={`/${locale}${item.href}`}
                    className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow">{t.footer.contacts}</h2>
            <ul className="mt-4 space-y-3.5 text-[0.875rem]">
              <li className="flex gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[var(--color-faint)]" />
                <span className="text-[var(--color-muted)]">
                  {config.addressLine1}
                  <br />
                  {config.addressLine2}, {config.city}
                </span>
              </li>
              <li className="flex gap-3">
                <Phone size={16} className="mt-0.5 shrink-0 text-[var(--color-faint)]" />
                <a href={`tel:${config.phoneRaw}`} className="tabular text-[var(--color-muted)] hover:text-[var(--color-text)]">
                  {config.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-[var(--color-faint)]" />
                <a href={`mailto:${config.email}`} className="break-all text-[var(--color-muted)] hover:text-[var(--color-text)]">
                  {config.email}
                </a>
              </li>
              <li className="flex gap-3">
                <Route size={16} className="mt-0.5 shrink-0 text-[var(--color-faint)]" />
                <a
                  href={brand.links.gis2Route}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
                >
                  {t.cta.route}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[var(--color-line)] pt-6 text-[0.75rem] text-[var(--color-faint)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {brand.name}. {t.footer.rights}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href={`/${locale}/privacy`} className="hover:text-[var(--color-muted)]">
              {t.footer.privacy}
            </Link>
            <span className="hidden sm:inline" aria-hidden>
              ·
            </span>
            <span>
              {t.footer.sourcesNote}: 2GIS, {brand.rating.checkedAt}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
