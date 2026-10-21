import "server-only";
import { brand } from "@/content/brand";
import { prisma } from "./db";

export type PublicConfig = {
  phone: string;
  phoneRaw: string;
  whatsapp: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  hoursNoteRu: string;
  hoursNoteKz: string;
  opensAt: string;
};

export const CONFIG_KEYS = {
  phone: "contact.phone",
  whatsapp: "contact.whatsapp",
  email: "contact.email",
  addressLine1: "address.line1",
  addressLine2: "address.line2",
  city: "address.city",
  postalCode: "address.postalCode",
  hoursNoteRu: "hours.note.ru",
  hoursNoteKz: "hours.note.kz",
  opensAt: "hours.opensAt",
} as const;

function defaults(): PublicConfig {
  return {
    phone: brand.contact.phone,
    phoneRaw: brand.contact.phoneRaw,
    whatsapp: brand.contact.whatsapp,
    email: brand.contact.email,
    addressLine1: brand.address.line1,
    addressLine2: brand.address.line2,
    city: brand.address.city,
    postalCode: brand.address.postalCode,
    hoursNoteRu: brand.hours.noteRu,
    hoursNoteKz: brand.hours.noteKz,
    opensAt: brand.hours.opensAt,
  };
}

/**
 * Contact details shown on the site. Values live in the database so the
 * owner can change a phone number without a redeploy; the verified brand
 * constants remain the fallback.
 */
export async function getConfig(): Promise<PublicConfig> {
  const base = defaults();
  try {
    const rows = await prisma.settings.findMany({
      where: { key: { in: Object.values(CONFIG_KEYS) } },
    });
    const map = new Map(rows.map((r) => [r.key, r.value]));
    const pick = (key: string, fallback: string) => {
      const value = map.get(key)?.trim();
      return value ? value : fallback;
    };

    const phone = pick(CONFIG_KEYS.phone, base.phone);
    const digits = pick(CONFIG_KEYS.whatsapp, base.whatsapp).replace(/\D/g, "");
    return {
      ...base,
      phone,
      phoneRaw: `+${phone.replace(/\D/g, "")}`,
      whatsapp: digits || base.whatsapp,
      email: pick(CONFIG_KEYS.email, base.email),
      addressLine1: pick(CONFIG_KEYS.addressLine1, base.addressLine1),
      addressLine2: pick(CONFIG_KEYS.addressLine2, base.addressLine2),
      city: pick(CONFIG_KEYS.city, base.city),
      postalCode: pick(CONFIG_KEYS.postalCode, base.postalCode),
      hoursNoteRu: pick(CONFIG_KEYS.hoursNoteRu, base.hoursNoteRu),
      hoursNoteKz: pick(CONFIG_KEYS.hoursNoteKz, base.hoursNoteKz),
      opensAt: pick(CONFIG_KEYS.opensAt, base.opensAt),
    };
  } catch {
    return base;
  }
}
