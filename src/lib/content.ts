import "server-only";
import { defaultPrograms } from "@/content/defaults";
import { ru } from "@/content/i18n/ru";
import type { Locale } from "./i18n";
import { prisma } from "./db";

export type ProgramView = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  price: number | null;
  priceNote: string | null;
  duration: string | null;
  theory: string | null;
  practice: string | null;
  transmission: string | null;
  includes: string[];
  extras: string | null;
  isPlaceholder: boolean;
};

export type FaqView = { q: string; a: string; pending?: boolean };

function mapProgram(p: (typeof defaultPrograms)[number], locale: Locale): ProgramView {
  const kz = locale === "kz";
  return {
    slug: p.slug,
    category: p.category,
    title: kz ? p.titleKz : p.titleRu,
    summary: kz ? p.summaryKz : p.summaryRu,
    price: p.priceKzt,
    priceNote: p.priceNote,
    duration: (kz ? p.durationKz : p.durationRu) ?? null,
    theory: (kz ? p.theoryKz : p.theoryRu) ?? null,
    practice: (kz ? p.practiceKz : p.practiceRu) ?? null,
    transmission: p.transmission,
    includes: ((kz ? p.includesKz : p.includesRu) ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    extras: (kz ? p.extrasKz : p.extrasRu) ?? null,
    isPlaceholder: p.isPlaceholder,
  };
}

/** Programs from the database; falls back to the seed defaults. */
export async function getPrograms(locale: Locale): Promise<ProgramView[]> {
  try {
    const rows = await prisma.program.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length === 0) return defaultPrograms.map((p) => mapProgram(p, locale));
    const kz = locale === "kz";
    return rows.map((r) => ({
      slug: r.slug,
      category: r.category,
      title: kz ? r.titleKz : r.titleRu,
      summary: kz ? r.summaryKz : r.summaryRu,
      price: r.priceKzt,
      priceNote: r.priceNote,
      duration: (kz ? r.durationKz : r.durationRu) ?? null,
      theory: (kz ? r.theoryKz : r.theoryRu) ?? null,
      practice: (kz ? r.practiceKz : r.practiceRu) ?? null,
      transmission: r.transmission,
      includes: ((kz ? r.includesKz : r.includesRu) ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      extras: (kz ? r.extrasKz : r.extrasRu) ?? null,
      isPlaceholder: r.isPlaceholder,
    }));
  } catch {
    return defaultPrograms.map((p) => mapProgram(p, locale));
  }
}

export async function getFaq(locale: Locale): Promise<FaqView[]> {
  const dictItems = ru.faq.items as readonly { q: string; a: string; pending?: boolean }[];
  const kzItems = (await import("@/content/i18n/kz")).kz.faq.items as readonly {
    q: string;
    a: string;
    pending?: boolean;
  }[];
  const fallback = (locale === "kz" ? kzItems : dictItems).map((i) => ({
    q: i.q,
    a: i.a,
    pending: i.pending,
  }));

  try {
    const rows = await prisma.faqItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length === 0) return fallback;
    return rows.map((r) => ({
      q: locale === "kz" ? r.questionKz : r.questionRu,
      a: locale === "kz" ? r.answerKz : r.answerRu,
      pending: r.needsOwner,
    }));
  } catch {
    return fallback;
  }
}

export async function getVehicles() {
  try {
    return await prisma.vehicle.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getInstructors() {
  try {
    return await prisma.instructor.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export function priceLabel(price: number | null): string | null {
  if (price === null || price === 0) return null;
  return `${price.toLocaleString("ru-RU")} ₸`;
}
