"use client";

import { useEffect } from "react";

/**
 * The document element lives in the static root layout, so the active
 * locale is applied here on mount. Crawlers additionally get hreflang
 * alternates and `content-language` from metadata.
 */
export function HtmlLang({ locale }: { locale: "ru" | "kz" }) {
  useEffect(() => {
    document.documentElement.lang = locale === "ru" ? "ru-KZ" : "kk-KZ";
    try {
      document.cookie = `qds_locale=${locale}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* ignore */
    }
  }, [locale]);

  return null;
}
