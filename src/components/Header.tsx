"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/content/i18n/ru";
import { brand } from "@/content/brand";
import { isLocale, switchLocalePath, type Locale } from "@/lib/i18n";
import { BookButton } from "@/components/booking/BookButton";
import { Close, Menu, Phone } from "@/components/Icons";

const NAV = [
  { key: "programs", href: "/programs", primary: true },
  { key: "process", href: "/process", primary: true },
  { key: "fleet", href: "/fleet", primary: false },
  { key: "instructors", href: "/instructors", primary: false },
  { key: "reviews", href: "/reviews", primary: true },
  { key: "faq", href: "/faq", primary: true },
  { key: "contacts", href: "/contacts", primary: true },
] as const;

export function Header({
  locale,
  t,
  phone,
  phoneRaw,
}: {
  locale: Locale;
  t: Dictionary;
  phone: string;
  phoneRaw: string;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) => {
    const full = `/${locale}${href}`;
    return pathname === full || pathname.startsWith(`${full}/`);
  };

  const nextLocale: Locale = locale === "ru" ? "kz" : "ru";

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: scrolled ? "rgba(8,9,10,0.86)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: `1px solid ${scrolled ? "var(--color-line)" : "transparent"}`,
        transition: "background-color .35s, border-color .35s, backdrop-filter .35s",
      }}
    >
      <div className="container-page flex h-[68px] items-center justify-between gap-4 sm:h-[76px]">
        <Link
          href={`/${locale}`}
          className="group flex shrink-0 items-center gap-2.5"
          aria-label={`${brand.name} — ${locale === "kz" ? "басты бетке" : "на главную"}`}
        >
          <span aria-hidden className="flex size-8 items-center justify-center rounded-[7px] border border-[var(--color-line-strong)]">
            <span className="block size-2.5 rotate-45 border border-[var(--color-accent)]" />
          </span>
          <span className="leading-none">
            <span className="block text-[0.95rem] font-extrabold tracking-[0.14em]">QAZAQ</span>
            <span className="mt-1 block text-[0.55rem] font-semibold tracking-[0.34em] text-[var(--color-muted)]">
              DRIVE SCHOOL
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={`/${locale}${item.href}`}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded-full px-3 py-2 text-[0.8125rem] font-medium transition-colors ${
                item.primary ? "" : "hidden xl:inline-flex"
              } ${
                isActive(item.href)
                  ? "text-[var(--color-text)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {t.nav[item.key]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="flex items-center rounded-full border border-[var(--color-line)] p-0.5 text-[0.7rem] font-semibold"
            role="group"
            aria-label="Language"
          >
            {(["ru", "kz"] as const).map((code) => (
              <Link
                key={code}
                href={switchLocalePath(pathname || `/${locale}`, code)}
                hrefLang={code === "ru" ? "ru" : "kk"}
                aria-current={locale === code ? "true" : undefined}
                className={`inline-flex min-h-8 min-w-9 items-center justify-center rounded-full px-3 py-1.5 uppercase tracking-[0.08em] transition-colors ${
                  locale === code
                    ? "bg-[rgba(255,255,255,0.09)] text-[var(--color-text)]"
                    : "text-[var(--color-faint)] hover:text-[var(--color-text)]"
                }`}
              >
                {code}
              </Link>
            ))}
          </div>

          <a
            href={`tel:${phoneRaw}`}
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-[0.8125rem] font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)] xl:inline-flex"
          >
            <Phone size={15} />
            <span className="tabular">{phone}</span>
          </a>

          <BookButton className="btn btn-primary btn-sm hidden sm:inline-flex">
            {t.nav.book}
          </BookButton>

          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full border border-[var(--color-line)] lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t.nav.close : t.nav.menu}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <Close size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="fixed inset-x-0 top-[68px] bottom-0 z-40 overflow-y-auto border-t border-[var(--color-line)] bg-[var(--color-ink)] lg:hidden"
      >
        <nav aria-label="Mobile" className="container-page flex flex-col py-4">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={`/${locale}${item.href}`}
              className="flex items-center justify-between border-b border-[var(--color-line)] py-4 text-[1.05rem] font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {t.nav[item.key]}
              <span aria-hidden className="text-[var(--color-faint)]">
                →
              </span>
            </Link>
          ))}
          <div className="mt-6 grid gap-3">
            <BookButton className="btn btn-primary w-full">{t.cta.book}</BookButton>
            <a href={`tel:${phoneRaw}`} className="btn btn-ghost w-full">
              <Phone size={16} />
              {phone}
            </a>
          </div>
          <p className="mt-6 pb-10 text-[0.78rem] leading-relaxed text-[var(--color-faint)]">
            {brand.address.line1} · {brand.address.line2}
            <br />
            {brand.address.city}
          </p>
        </nav>
      </div>
    </header>
  );
}
