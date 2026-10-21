/**
 * Idempotent seed: creates the first admin, the program cards and the FAQ.
 * Safe to run repeatedly — existing rows are updated, not duplicated.
 */
import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "node:crypto";
import { defaultPrograms } from "../src/content/defaults";
import { ru } from "../src/content/i18n/ru";
import { kz } from "../src/content/i18n/kz";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@qazaqdrive.kz").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";

  if (password.length < 12) {
    console.warn(
      `\n[seed] ADMIN_PASSWORD is missing or shorter than 12 characters.\n` +
        `       No admin user was created. Set ADMIN_PASSWORD in .env and re-run: npm run db:seed\n` +
        `       Example: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD="long-unique-password" npm run db:seed\n`,
    );
  } else {
    await prisma.adminUser.upsert({
      where: { email },
      create: { email, passwordHash: hashPassword(password), name: "Администратор" },
      update: {},
    });
    console.log(`[seed] admin ready: ${email}`);
  }

  for (const program of defaultPrograms) {
    await prisma.program.upsert({
      where: { slug: program.slug },
      create: {
        slug: program.slug,
        category: program.category,
        titleRu: program.titleRu,
        titleKz: program.titleKz,
        summaryRu: program.summaryRu,
        summaryKz: program.summaryKz,
        priceKzt: program.priceKzt,
        priceNote: program.priceNote,
        durationRu: program.durationRu,
        durationKz: program.durationKz,
        theoryRu: program.theoryRu,
        theoryKz: program.theoryKz,
        practiceRu: program.practiceRu,
        practiceKz: program.practiceKz,
        transmission: program.transmission,
        includesRu: program.includesRu,
        includesKz: program.includesKz,
        extrasRu: program.extrasRu,
        extrasKz: program.extrasKz,
        isActive: program.isActive,
        isPlaceholder: program.isPlaceholder,
        sortOrder: program.sortOrder,
      },
      update: {},
    });
  }
  console.log(`[seed] programs: ${defaultPrograms.length}`);

  const existingFaq = await prisma.faqItem.count();
  if (existingFaq === 0) {
    const items = ru.faq.items as readonly { q: string; a: string; pending?: boolean }[];
    const itemsKz = kz.faq.items as readonly { q: string; a: string; pending?: boolean }[];

    for (let i = 0; i < items.length; i++) {
      await prisma.faqItem.create({
        data: {
          questionRu: items[i].q,
          questionKz: itemsKz[i]?.q ?? items[i].q,
          answerRu: items[i].a,
          answerKz: itemsKz[i]?.a ?? items[i].a,
          needsOwner: Boolean(items[i].pending),
          isActive: true,
          sortOrder: i + 1,
        },
      });
    }
    console.log(`[seed] faq: ${items.length}`);
  } else {
    console.log(`[seed] faq already present (${existingFaq}) — skipped`);
  }
}

main()
  .catch((error) => {
    console.error("[seed] failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
