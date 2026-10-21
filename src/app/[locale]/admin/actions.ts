"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { createSession, destroySession, getSessionUser, hashPassword, verifyPassword } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { dispatchNotifications } from "@/lib/leads";
import { CONFIG_KEYS } from "@/lib/settings";
import { notifyTelegram } from "@/lib/integrations";
import { STATUSES } from "@/lib/validation";

const s = (v: FormDataEntryValue | null, max = 400) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
const n = (v: FormDataEntryValue | null) => {
  const digits = typeof v === "string" ? v.replace(/\D/g, "") : "";
  return digits ? Number(digits) : null;
};

async function ensureAdmin() {
  const user = await getSessionUser();
  if (!user) redirect("/ru/admin/login");
  return user;
}

/* --------------------------------- auth -------------------------------- */

export async function loginAction(formData: FormData) {
  const locale = s(formData.get("locale"), 2) || "ru";
  const email = s(formData.get("email"), 120).toLowerCase();
  const password = typeof formData.get("password") === "string" ? String(formData.get("password")) : "";

  const h = await headers();
  const key = clientKey(h, "admin-login");
  const limit = await rateLimit(key, 8, 10 * 60 * 1000);
  if (!limit.ok) redirect(`/${locale}/admin/login?e=rate`);

  if (!email || password.length < 8) redirect(`/${locale}/admin/login?e=1`);

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    redirect(`/${locale}/admin/login?e=1`);
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  await createSession(user.id);
  redirect(`/${locale}/admin`);
}

export async function logoutAction(formData: FormData) {
  const locale = s(formData.get("locale"), 2) || "ru";
  await destroySession();
  redirect(`/${locale}/admin/login`);
}

/* -------------------------------- leads -------------------------------- */

export async function setLeadStatusAction(formData: FormData) {
  const user = await ensureAdmin();
  const id = s(formData.get("id"), 40);
  const status = s(formData.get("status"), 20);
  const locale = s(formData.get("locale"), 2) || "ru";
  if (!id || !STATUSES.includes(status as never)) return;

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return;

  await prisma.lead.update({
    where: { id },
    data: {
      status,
      lastContactAt: status === "new" ? lead.lastContactAt : new Date(),
    },
  });
  await prisma.leadEvent.create({
    data: {
      leadId: id,
      type: "status",
      actor: user.email,
      payload: JSON.stringify({ from: lead.status, to: status, via: "admin" }),
    },
  });
  revalidatePath(`/${locale}/admin/leads`);
  revalidatePath(`/${locale}/admin/leads/${id}`);
  revalidatePath(`/${locale}/admin`);
}

export async function saveNoteAction(formData: FormData) {
  const user = await ensureAdmin();
  const id = s(formData.get("id"), 40);
  const note = s(formData.get("note"), 2000);
  const locale = s(formData.get("locale"), 2) || "ru";
  if (!id) return;

  await prisma.lead.update({ where: { id }, data: { internalNotes: note || null } });
  await prisma.leadEvent.create({
    data: { leadId: id, type: "note", actor: user.email, payload: note.slice(0, 500) },
  });
  revalidatePath(`/${locale}/admin/leads/${id}`);
}

export async function markContactAction(formData: FormData) {
  const user = await ensureAdmin();
  const id = s(formData.get("id"), 40);
  const locale = s(formData.get("locale"), 2) || "ru";
  if (!id) return;

  await prisma.lead.update({ where: { id }, data: { lastContactAt: new Date() } });
  await prisma.leadEvent.create({
    data: { leadId: id, type: "contact", actor: user.email, payload: null },
  });
  revalidatePath(`/${locale}/admin/leads/${id}`);
}

export async function resendNotificationsAction(formData: FormData) {
  await ensureAdmin();
  const id = s(formData.get("id"), 40);
  const locale = s(formData.get("locale"), 2) || "ru";
  if (!id) return;
  await dispatchNotifications(id);
  revalidatePath(`/${locale}/admin/leads/${id}`);
  revalidatePath(`/${locale}/admin/integrations`);
}

/* ------------------------------- content ------------------------------- */

export async function saveProgramAction(formData: FormData) {
  await ensureAdmin();
  const locale = s(formData.get("locale"), 2) || "ru";
  const id = s(formData.get("id"), 40);
  const data = {
    slug: s(formData.get("slug"), 60).toLowerCase().replace(/[^a-z0-9-]/g, "-") || `program-${Date.now()}`,
    category: s(formData.get("category"), 40) || "B",
    titleRu: s(formData.get("titleRu"), 160) || "Без названия",
    titleKz: s(formData.get("titleKz"), 160) || s(formData.get("titleRu"), 160) || "Атауы жоқ",
    summaryRu: s(formData.get("summaryRu"), 600),
    summaryKz: s(formData.get("summaryKz"), 600),
    priceKzt: n(formData.get("priceKzt")),
    priceNote: s(formData.get("priceNote"), 120) || null,
    durationRu: s(formData.get("durationRu"), 120) || null,
    durationKz: s(formData.get("durationKz"), 120) || null,
    theoryRu: s(formData.get("theoryRu"), 600) || null,
    theoryKz: s(formData.get("theoryKz"), 600) || null,
    practiceRu: s(formData.get("practiceRu"), 600) || null,
    practiceKz: s(formData.get("practiceKz"), 600) || null,
    transmission: s(formData.get("transmission"), 20) || null,
    includesRu: s(formData.get("includesRu"), 600) || null,
    includesKz: s(formData.get("includesKz"), 600) || null,
    extrasRu: s(formData.get("extrasRu"), 600) || null,
    extrasKz: s(formData.get("extrasKz"), 600) || null,
    isActive: formData.get("isActive") === "on",
    isPlaceholder: false,
    sortOrder: n(formData.get("sortOrder")) ?? 0,
  };

  if (id) await prisma.program.update({ where: { id }, data });
  else await prisma.program.create({ data });

  revalidatePath(`/${locale}/programs`);
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/admin/content`);
}

export async function deleteProgramAction(formData: FormData) {
  await ensureAdmin();
  const id = s(formData.get("id"), 40);
  const locale = s(formData.get("locale"), 2) || "ru";
  if (id) await prisma.program.delete({ where: { id } }).catch(() => undefined);
  revalidatePath(`/${locale}/programs`);
  revalidatePath(`/${locale}/admin/content`);
}

export async function saveFaqAction(formData: FormData) {
  await ensureAdmin();
  const locale = s(formData.get("locale"), 2) || "ru";
  const id = s(formData.get("id"), 40);
  const data = {
    questionRu: s(formData.get("questionRu"), 300) || "Вопрос",
    questionKz: s(formData.get("questionKz"), 300) || s(formData.get("questionRu"), 300) || "Сұрақ",
    answerRu: s(formData.get("answerRu"), 2000),
    answerKz: s(formData.get("answerKz"), 2000),
    needsOwner: formData.get("needsOwner") === "on",
    isActive: formData.get("isActive") === "on",
    sortOrder: n(formData.get("sortOrder")) ?? 0,
  };
  if (id) await prisma.faqItem.update({ where: { id }, data });
  else await prisma.faqItem.create({ data });
  revalidatePath(`/${locale}/faq`);
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/admin/content`);
}

export async function deleteFaqAction(formData: FormData) {
  await ensureAdmin();
  const id = s(formData.get("id"), 40);
  const locale = s(formData.get("locale"), 2) || "ru";
  if (id) await prisma.faqItem.delete({ where: { id } }).catch(() => undefined);
  revalidatePath(`/${locale}/faq`);
  revalidatePath(`/${locale}/admin/content`);
}

export async function saveInstructorAction(formData: FormData) {
  await ensureAdmin();
  const locale = s(formData.get("locale"), 2) || "ru";
  const id = s(formData.get("id"), 40);
  const data = {
    name: s(formData.get("name"), 120) || "Инструктор",
    roleRu: s(formData.get("roleRu"), 120) || null,
    roleKz: s(formData.get("roleKz"), 120) || null,
    experience: s(formData.get("experience"), 80) || null,
    specialties: s(formData.get("specialties"), 200) || null,
    languages: s(formData.get("languages"), 120) || null,
    photoUrl: s(formData.get("photoUrl"), 400) || null,
    isActive: formData.get("isActive") === "on",
    isPlaceholder: false,
    sortOrder: n(formData.get("sortOrder")) ?? 0,
  };
  if (id) await prisma.instructor.update({ where: { id }, data });
  else await prisma.instructor.create({ data });
  revalidatePath(`/${locale}/instructors`);
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/admin/content`);
}

export async function deleteInstructorAction(formData: FormData) {
  await ensureAdmin();
  const id = s(formData.get("id"), 40);
  const locale = s(formData.get("locale"), 2) || "ru";
  if (id) await prisma.instructor.delete({ where: { id } }).catch(() => undefined);
  revalidatePath(`/${locale}/instructors`);
  revalidatePath(`/${locale}/admin/content`);
}

export async function saveVehicleAction(formData: FormData) {
  await ensureAdmin();
  const locale = s(formData.get("locale"), 2) || "ru";
  const id = s(formData.get("id"), 40);
  const data = {
    make: s(formData.get("make"), 60) || "Учебный",
    model: s(formData.get("model"), 60) || "автомобиль",
    transmission: s(formData.get("transmission"), 20) || null,
    category: s(formData.get("category"), 20) || null,
    featuresRu: s(formData.get("featuresRu"), 300) || null,
    featuresKz: s(formData.get("featuresKz"), 300) || null,
    photoUrl: s(formData.get("photoUrl"), 400) || null,
    isActive: formData.get("isActive") === "on",
    isPlaceholder: false,
    sortOrder: n(formData.get("sortOrder")) ?? 0,
  };
  if (id) await prisma.vehicle.update({ where: { id }, data });
  else await prisma.vehicle.create({ data });
  revalidatePath(`/${locale}/fleet`);
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/admin/content`);
}

export async function deleteVehicleAction(formData: FormData) {
  await ensureAdmin();
  const id = s(formData.get("id"), 40);
  const locale = s(formData.get("locale"), 2) || "ru";
  if (id) await prisma.vehicle.delete({ where: { id } }).catch(() => undefined);
  revalidatePath(`/${locale}/fleet`);
  revalidatePath(`/${locale}/admin/content`);
}

/* ------------------------------- settings ------------------------------ */

export async function saveSettingsAction(formData: FormData) {
  await ensureAdmin();
  const locale = s(formData.get("locale"), 2) || "ru";
  const entries: [string, string][] = [
    [CONFIG_KEYS.phone, s(formData.get("phone"), 40)],
    [CONFIG_KEYS.whatsapp, s(formData.get("whatsapp"), 40).replace(/\D/g, "")],
    [CONFIG_KEYS.email, s(formData.get("email"), 120)],
    [CONFIG_KEYS.addressLine1, s(formData.get("addressLine1"), 160)],
    [CONFIG_KEYS.addressLine2, s(formData.get("addressLine2"), 160)],
    [CONFIG_KEYS.city, s(formData.get("city"), 80)],
    [CONFIG_KEYS.postalCode, s(formData.get("postalCode"), 20)],
    [CONFIG_KEYS.hoursNoteRu, s(formData.get("hoursNoteRu"), 200)],
    [CONFIG_KEYS.hoursNoteKz, s(formData.get("hoursNoteKz"), 200)],
    [CONFIG_KEYS.opensAt, s(formData.get("opensAt"), 10)],
  ];

  for (const [key, value] of entries) {
    if (!value) continue;
    await prisma.settings.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  revalidatePath(`/${locale}`, "layout");
  revalidatePath(`/${locale}/admin/settings`);
}

/* ------------------------------ integrations ---------------------------- */

export async function testTelegramAction(formData: FormData) {
  await ensureAdmin();
  const locale = s(formData.get("locale"), 2) || "ru";
  await notifyTelegram({
    id: "test",
    publicId: "QDS-TEST",
    name: "Проверка интеграции",
    phone: "+77080861028",
    intent: "consult",
    source: "admin-test",
    createdAt: new Date(),
    locale,
  });
  revalidatePath(`/${locale}/admin/integrations`);
}

/* -------------------------------- admin -------------------------------- */

export async function createAdminAction(formData: FormData) {
  await ensureAdmin();
  const locale = s(formData.get("locale"), 2) || "ru";
  const email = s(formData.get("newEmail"), 120).toLowerCase();
  const password = typeof formData.get("newPassword") === "string" ? String(formData.get("newPassword")) : "";
  if (!email || password.length < 12) {
    redirect(`/${locale}/admin/settings?pwd=weak`);
  }
  await prisma.adminUser.upsert({
    where: { email },
    create: { email, passwordHash: hashPassword(password), name: s(formData.get("newName"), 80) || "Администратор" },
    update: { passwordHash: hashPassword(password) },
  });
  revalidatePath(`/${locale}/admin/settings`);
}

export async function changePasswordAction(formData: FormData) {
  const user = await ensureAdmin();
  const locale = s(formData.get("locale"), 2) || "ru";
  const current = typeof formData.get("currentPassword") === "string" ? String(formData.get("currentPassword")) : "";
  const next = typeof formData.get("newPassword") === "string" ? String(formData.get("newPassword")) : "";
  const record = await prisma.adminUser.findUnique({ where: { id: user.id } });
  if (!record || !verifyPassword(current, record.passwordHash) || next.length < 12) {
    redirect(`/${locale}/admin/settings?pwd=error`);
  }
  await prisma.adminUser.update({ where: { id: user.id }, data: { passwordHash: hashPassword(next) } });
  redirect(`/${locale}/admin/settings?pwd=ok`);
}
