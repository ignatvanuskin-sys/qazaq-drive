"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Dictionary } from "@/content/i18n/ru";
import type { Locale } from "@/lib/i18n";
import { BookingModal } from "./BookingModal";

type Prefill = { intent?: string; program?: string; comment?: string };

type BookingApi = {
  open: (prefill?: Prefill) => void;
  close: () => void;
  isOpen: boolean;
};

const BookingContext = createContext<BookingApi | null>(null);

export function useBooking(): BookingApi {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}

export function BookingProvider({
  locale,
  t,
  whatsapp,
  common,
  children,
}: {
  locale: Locale;
  t: Dictionary;
  whatsapp: string;
  common: { close: string; whatsapp: string };
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefill, setPrefill] = useState<Prefill | undefined>();

  const open = useCallback((next?: Prefill) => {
    setPrefill(next);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <BookingContext.Provider value={value}>
      {children}
      {isOpen ? (
        <BookingModal locale={locale} t={t} whatsapp={whatsapp} prefills={prefill} onClose={close} />
      ) : null}
    </BookingContext.Provider>
  );
}
