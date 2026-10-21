import { notFound } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getConfig } from "@/lib/settings";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminCard, Field, TextArea } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { changePasswordAction, createAdminAction, saveSettingsAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ pwd?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const l = (ru: string, kz: string) => (locale === "kz" ? kz : ru);
  const config = await getConfig();
  const { pwd } = await searchParams;
  const user = await getSessionUser();
  const admins = await prisma.adminUser.findMany({ select: { email: true, name: true, lastLoginAt: true } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display-m text-[1.5rem]">{t.admin.settings}</h1>
        <p className="mt-1 text-[0.8rem] text-[var(--color-faint)]">
          {l("Контакты на сайте и доступы администраторов.", "Сайттағы байланыс және әкімші рұқсаттары.")}
        </p>
      </div>

      {pwd ? (
        <p
          className={`rounded-[6px] border px-3 py-2 text-[0.8rem] ${
            pwd === "ok"
              ? "border-[rgba(140,200,150,0.35)] bg-[rgba(140,200,150,0.08)] text-[#a5d8b0]"
              : "border-[rgba(224,108,90,0.4)] bg-[rgba(224,108,90,0.08)] text-[#f0937f]"
          }`}
          role="status"
        >
          {pwd === "ok"
            ? l("Пароль обновлён", "Құпия сөз жаңартылды")
            : pwd === "weak"
              ? l("Пароль слишком короткий (минимум 12 символов)", "Құпия сөз тым қысқа (кемінде 12 таңба)")
              : l("Не удалось изменить пароль: проверьте текущий", "Құпия сөзді өзгерту мүмкін болмады: ағымдағыны тексеріңіз")}
        </p>
      ) : null}

      <AdminCard
        title={l("Контакты на сайте", "Сайттағы байланыс")}
        description={l(
          "Значения сразу используются в шапке, подвале и на странице контактов.",
          "Мәндер бірден тақырыпта, төменгі бөлікте және байланыс бетінде қолданылады.",
        )}
      >
        <form action={saveSettingsAction} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="locale" value={locale} />
          <Field label={t.contacts.phone} name="phone" defaultValue={config.phone} />
          <Field label="WhatsApp (только цифры)" name="whatsapp" defaultValue={config.whatsapp} />
          <Field label={t.contacts.email} name="email" type="email" defaultValue={config.email} />
          <Field label={l("Время открытия", "Ашылу уақыты")} name="opensAt" defaultValue={config.opensAt} />
          <Field label={l("Адрес, строка 1", "Мекенжай, 1-жол")} name="addressLine1" defaultValue={config.addressLine1} />
          <Field label={l("Адрес, строка 2", "Мекенжай, 2-жол")} name="addressLine2" defaultValue={config.addressLine2} />
          <Field label={l("Город", "Қала")} name="city" defaultValue={config.city} />
          <Field label={l("Индекс", "Индекс")} name="postalCode" defaultValue={config.postalCode} />
          <TextArea label={l("Примечание к графику (RU)", "Кесте ескертпесі (RU)")} name="hoursNoteRu" defaultValue={config.hoursNoteRu} rows={2} />
          <TextArea label={l("Кесте ескертпесі (KZ)", "Кесте ескертпесі (KZ)")} name="hoursNoteKz" defaultValue={config.hoursNoteKz} rows={2} />
          <div className="sm:col-span-2">
            <SubmitButton>{t.admin.save}</SubmitButton>
          </div>
        </form>
      </AdminCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard title={l("Сменить свой пароль", "Өз құпия сөзін өзгерту")}>
          <form action={changePasswordAction} className="space-y-3">
            <input type="hidden" name="locale" value={locale} />
            <Field label={l("Текущий пароль", "Ағымдағы құпия сөз")} name="currentPassword" type="password" required />
            <Field
              label={l("Новый пароль", "Жаңа құпия сөз")}
              name="newPassword"
              type="password"
              required
              hint={l("Минимум 12 символов", "Кемінде 12 таңба")}
            />
            <SubmitButton>{t.admin.save}</SubmitButton>
          </form>
        </AdminCard>

        <AdminCard
          title={l("Добавить администратора", "Әкімші қосу")}
          description={l("Пароль хранится в виде scrypt-хэша.", "Құпия сөз scrypt-хэш түрінде сақталады.")}
        >
          <form action={createAdminAction} className="space-y-3">
            <input type="hidden" name="locale" value={locale} />
            <Field label={l("Имя", "Есімі")} name="newName" />
            <Field label="Email" name="newEmail" type="email" required />
            <Field
              label={l("Пароль", "Құпия сөз")}
              name="newPassword"
              type="password"
              required
              hint={l("Минимум 12 символов", "Кемінде 12 таңба")}
            />
            <SubmitButton>{l("Создать", "Жасау")}</SubmitButton>
          </form>
          <ul className="mt-4 space-y-1.5 border-t border-[var(--color-line)] pt-3 text-[0.75rem] text-[var(--color-faint)]">
            {admins.map((admin) => (
              <li key={admin.email} className="flex justify-between gap-3">
                <span>
                  {admin.name} · {admin.email}
                  {admin.email === user?.email ? " (вы)" : ""}
                </span>
                <span className="whitespace-nowrap">
                  {admin.lastLoginAt ? admin.lastLoginAt.toLocaleDateString("ru-RU") : "—"}
                </span>
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>
    </div>
  );
}
