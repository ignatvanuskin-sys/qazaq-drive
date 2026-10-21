"use client";

import { useEffect, useRef } from "react";
import type { Dictionary } from "@/content/i18n/ru";
import type { Locale } from "@/lib/i18n";
import { brand } from "@/content/brand";
import { Close } from "@/components/Icons";
import { BookingWizard } from "./BookingWizard";

export function BookingModal({
  locale,
  t,
  whatsapp,
  prefills,
  onClose,
}: {
  locale: Locale;
  t: Dictionary;
  whatsapp: string;
  prefills?: { intent?: string; program?: string; comment?: string };
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreFocus.current = document.activeElement as HTMLElement;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("h2")?.focus();
    }, 40);

    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      restoreFocus.current?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t.cta.close}
        className="absolute inset-0 cursor-default bg-[rgba(4,5,6,0.72)] backdrop-blur-[3px]"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="relative z-10 flex max-h-[92dvh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-[22px] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.9)] sm:rounded-[18px]"
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-line)] px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <div className="eyebrow">{brand.nameShort}</div>
            <h2 id="booking-title" className="mt-1 truncate text-[0.95rem] font-semibold">
              {t.booking.h1}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.cta.close}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-line-strong)] hover:text-[var(--color-text)]"
          >
            <Close size={17} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <BookingWizard
            locale={locale}
            t={t}
            whatsapp={whatsapp}
            stickyFooter
            compact
            initialIntent={prefills?.intent}
            initialProgram={prefills?.program}
            initialComment={prefills?.comment}
            onDone={onClose}
          />
        </div>
      </div>
    </div>
  );
}
