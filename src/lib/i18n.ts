import { ru, type Dictionary } from "@/content/i18n/ru";
import { kz } from "@/content/i18n/kz";

export const locales = ["ru", "kz"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";

const dictionaries: Record<Locale, Dictionary> = { ru, kz };

export function isLocale(value: string | undefined): value is Locale {
  return value === "ru" || value === "kz";
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? ru;
}

export function otherLocale(locale: Locale): Locale {
  return locale === "ru" ? "kz" : "ru";
}

/** Build a locale-aware path: path("/kz", "/programs") -> "/kz/programs" */
export function localePath(locale: Locale, path = ""): string {
  const clean = path === "/" ? "" : path;
  return `/${locale}${clean}`;
}

/** Swap the locale segment while keeping the rest of the path. */
export function switchLocalePath(pathname: string, next: Locale): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return `/${next}`;
  if (isLocale(parts[0])) {
    parts[0] = next;
    return `/${parts.join("/")}`;
  }
  return `/${next}/${parts.join("/")}`;
}
