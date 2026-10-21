import { notFound } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/db";
import { AdminCard, Field, Select, TextArea, Toggle } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import {
  deleteFaqAction,
  deleteInstructorAction,
  deleteProgramAction,
  deleteVehicleAction,
  saveFaqAction,
  saveInstructorAction,
  saveProgramAction,
  saveVehicleAction,
} from "../../actions";

export const dynamic = "force-dynamic";

function Disclosure({
  summary,
  meta,
  children,
  open,
}: {
  summary: string;
  meta?: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details open={open} className="border-b border-[var(--color-line)] last:border-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-1 py-3.5 text-[0.85rem] [&::-webkit-details-marker]:hidden">
        <span className="font-medium">{summary}</span>
        <span className="text-[0.7rem] text-[var(--color-faint)]">{meta}</span>
      </summary>
      <div className="pb-5 pl-1">{children}</div>
    </details>
  );
}

function DeleteForm({ action, id, locale, label }: { action: (fd: FormData) => Promise<void>; id: string; locale: string; label: string }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="locale" value={locale} />
      <SubmitButton className="btn btn-sm !min-h-8 border border-[rgba(224,108,90,0.35)] !bg-transparent !px-3 !text-[0.72rem] !text-[#f0937f]">
        {label}
      </SubmitButton>
    </form>
  );
}

export default async function ContentPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const l = (ru: string, kz: string) => (locale === "kz" ? kz : ru);

  const [programs, faq, instructors, vehicles] = await Promise.all([
    prisma.program.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.instructor.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.vehicle.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display-m text-[1.5rem]">{t.admin.content}</h1>
        <p className="mt-1 max-w-[52rem] text-[0.8rem] leading-relaxed text-[var(--color-faint)]">
          {l(
            "Изменения сразу попадают на сайт. Пустая цена означает «по запросу» — так школа не публикует неподтверждённые тарифы.",
            "Өзгерістер сайтқа бірден шығады. Бос баға «сұраныс бойынша» дегенді білдіреді — мектеп расталмаған тарифтерді жарияламайды.",
          )}
        </p>
      </div>

      {/* PROGRAMS */}
      <AdminCard
        title={t.admin.programsEditor}
        description={l("Стоимость в тенге. Оставьте пустым, чтобы показывать «по запросу».", "Теңгемен құны. «Сұраныс бойынша» көрсету үшін бос қалдырыңыз.")}
      >
        {programs.length === 0 ? (
          <p className="text-[0.8rem] text-[var(--color-faint)]">
            {l("Программ пока нет — сайт показывает встроенные значения.", "Әзірге бағдарлама жоқ — сайт кірістірілген мәндерді көрсетеді.")}
          </p>
        ) : (
          programs.map((program) => (
            <Disclosure
              key={program.id}
              summary={`${program.category} — ${program.titleRu}`}
              meta={program.priceKzt ? `${program.priceKzt.toLocaleString("ru-RU")} ₸` : t.ui.onRequest}
            >
              <form action={saveProgramAction} className="grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={program.id} />
                <input type="hidden" name="locale" value={locale} />
                <Field label="Slug" name="slug" defaultValue={program.slug} />
                <Field label="Категория" name="category" defaultValue={program.category} />
                <Field label="Название (RU)" name="titleRu" defaultValue={program.titleRu} required />
                <Field label="Атауы (KZ)" name="titleKz" defaultValue={program.titleKz} />
                <TextArea label="Описание (RU)" name="summaryRu" defaultValue={program.summaryRu} />
                <TextArea label="Сипаттама (KZ)" name="summaryKz" defaultValue={program.summaryKz} />
                <Field label="Цена, ₸" name="priceKzt" type="number" min="0" step="1000" defaultValue={program.priceKzt ?? ""} />
                <Field label="Примечание к цене" name="priceNote" defaultValue={program.priceNote} />
                <Field label="Срок (RU)" name="durationRu" defaultValue={program.durationRu} />
                <Field label="Мерзім (KZ)" name="durationKz" defaultValue={program.durationKz} />
                <TextArea label="Теория (RU)" name="theoryRu" defaultValue={program.theoryRu} rows={2} />
                <TextArea label="Теория (KZ)" name="theoryKz" defaultValue={program.theoryKz} rows={2} />
                <TextArea label="Практика (RU)" name="practiceRu" defaultValue={program.practiceRu} rows={2} />
                <TextArea label="Практика (KZ)" name="practiceKz" defaultValue={program.practiceKz} rows={2} />
                <Select
                  label="Коробка передач"
                  name="transmission"
                  defaultValue={program.transmission ?? ""}
                  options={[
                    { value: "", label: t.ui.toBeConfirmed },
                    { value: "manual", label: t.fleet.transmissionManual },
                    { value: "automatic", label: t.fleet.transmissionAuto },
                    { value: "both", label: t.fleet.transmissionBoth },
                  ]}
                />
                <Field label="Порядок" name="sortOrder" type="number" defaultValue={program.sortOrder} />
                <TextArea label="Что входит (RU, по строке)" name="includesRu" defaultValue={program.includesRu} />
                <TextArea label="Не кіреді (KZ, жол сайын)" name="includesKz" defaultValue={program.includesKz} />
                <TextArea label="Доп. расходы (RU)" name="extrasRu" defaultValue={program.extrasRu} rows={2} />
                <TextArea label="Қосымша шығыстар (KZ)" name="extrasKz" defaultValue={program.extrasKz} rows={2} />
                <div className="flex items-end gap-3 sm:col-span-2">
                  <Toggle label={l("Активна", "Белсенді")} name="isActive" defaultChecked={program.isActive} />
                  <SubmitButton>{t.admin.save}</SubmitButton>
                  <DeleteForm action={deleteProgramAction} id={program.id} locale={locale} label={l("Удалить", "Жою")} />
                </div>
              </form>
            </Disclosure>
          ))
        )}

        <Disclosure summary={l("+ Добавить программу", "+ Бағдарлама қосу")}>
          <form action={saveProgramAction} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="locale" value={locale} />
            <Field label="Slug" name="slug" placeholder="category-e" />
            <Field label="Категория" name="category" placeholder="E" />
            <Field label="Название (RU)" name="titleRu" required />
            <Field label="Атауы (KZ)" name="titleKz" />
            <TextArea label="Описание (RU)" name="summaryRu" />
            <TextArea label="Сипаттама (KZ)" name="summaryKz" />
            <Field label="Цена, ₸" name="priceKzt" type="number" min="0" step="1000" />
            <Field label="Порядок" name="sortOrder" type="number" defaultValue={programs.length + 1} />
            <div className="flex items-end gap-3 sm:col-span-2">
              <Toggle label={l("Активна", "Белсенді")} name="isActive" defaultChecked />
              <SubmitButton>{l("Добавить", "Қосу")}</SubmitButton>
            </div>
          </form>
        </Disclosure>
      </AdminCard>

      {/* FAQ */}
      <AdminCard
        title={t.admin.faqEditor}
        description={l("Пометка «требует уточнения» показывается посетителям как «уточняется».", "«Нақтылауды қажет етеді» белгісі келушілерге «нақтылануда» деп көрсетіледі.")}
      >
        {faq.length === 0 ? (
          <p className="text-[0.8rem] text-[var(--color-faint)]">
            {l("FAQ берётся из встроенного словаря.", "FAQ кірістірілген сөздіктен алынады.")}
          </p>
        ) : (
          faq.map((item) => (
            <Disclosure key={item.id} summary={item.questionRu} meta={item.needsOwner ? "!" : ""}>
              <form action={saveFaqAction} className="grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="locale" value={locale} />
                <Field label="Вопрос (RU)" name="questionRu" defaultValue={item.questionRu} required />
                <Field label="Сұрақ (KZ)" name="questionKz" defaultValue={item.questionKz} />
                <TextArea label="Ответ (RU)" name="answerRu" defaultValue={item.answerRu} rows={4} />
                <TextArea label="Жауап (KZ)" name="answerKz" defaultValue={item.answerKz} rows={4} />
                <Field label="Порядок" name="sortOrder" type="number" defaultValue={item.sortOrder} />
                <div className="flex items-end gap-3">
                  <Toggle label={l("Требует уточнения", "Нақтылауды қажет етеді")} name="needsOwner" defaultChecked={item.needsOwner} />
                  <Toggle label={l("Активен", "Белсенді")} name="isActive" defaultChecked={item.isActive} />
                </div>
                <div className="flex items-center gap-3 sm:col-span-2">
                  <SubmitButton>{t.admin.save}</SubmitButton>
                  <DeleteForm action={deleteFaqAction} id={item.id} locale={locale} label={l("Удалить", "Жою")} />
                </div>
              </form>
            </Disclosure>
          ))
        )}
        <Disclosure summary={l("+ Добавить вопрос", "+ Сұрақ қосу")}>
          <form action={saveFaqAction} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="locale" value={locale} />
            <Field label="Вопрос (RU)" name="questionRu" required />
            <Field label="Сұрақ (KZ)" name="questionKz" />
            <TextArea label="Ответ (RU)" name="answerRu" rows={3} />
            <TextArea label="Жауап (KZ)" name="answerKz" rows={3} />
            <Field label="Порядок" name="sortOrder" type="number" defaultValue={faq.length + 1} />
            <div className="flex items-end gap-3">
              <Toggle label={l("Активен", "Белсенді")} name="isActive" defaultChecked />
              <SubmitButton>{l("Добавить", "Қосу")}</SubmitButton>
            </div>
          </form>
        </Disclosure>
      </AdminCard>

      {/* INSTRUCTORS */}
      <AdminCard
        title={t.admin.instructorsEditor}
        description={l("Не публикуйте профиль без согласия инструктора и проверенных данных.", "Нұсқаушының келісімінсіз және тексерілген деректерсіз профиль жарияламаңыз.")}
      >
        {instructors.length === 0 ? (
          <p className="text-[0.8rem] text-[var(--color-faint)]">
            {l("Профилей нет — на сайте показывается честная заглушка.", "Профиль жоқ — сайтта адал дайындама көрсетіледі.")}
          </p>
        ) : (
          instructors.map((person) => (
            <Disclosure key={person.id} summary={person.name} meta={person.languages ?? ""}>
              <form action={saveInstructorAction} className="grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={person.id} />
                <input type="hidden" name="locale" value={locale} />
                <Field label={l("Имя", "Есімі")} name="name" defaultValue={person.name} required />
                <Field label={l("Фото (URL)", "Фото (URL)")} name="photoUrl" defaultValue={person.photoUrl} />
                <Field label="Роль (RU)" name="roleRu" defaultValue={person.roleRu} />
                <Field label="Рөлі (KZ)" name="roleKz" defaultValue={person.roleKz} />
                <Field label={l("Опыт", "Тәжірибе")} name="experience" defaultValue={person.experience} />
                <Field label={l("Языки", "Тілдер")} name="languages" defaultValue={person.languages} />
                <Field label={l("Специализация", "Мамандығы")} name="specialties" defaultValue={person.specialties} />
                <Field label={l("Порядок", "Реті")} name="sortOrder" type="number" defaultValue={person.sortOrder} />
                <div className="flex items-center gap-3 sm:col-span-2">
                  <Toggle label={l("Активен", "Белсенді")} name="isActive" defaultChecked={person.isActive} />
                  <SubmitButton>{t.admin.save}</SubmitButton>
                  <DeleteForm action={deleteInstructorAction} id={person.id} locale={locale} label={l("Удалить", "Жою")} />
                </div>
              </form>
            </Disclosure>
          ))
        )}
        <Disclosure summary={l("+ Добавить инструктора", "+ Нұсқаушы қосу")}>
          <form action={saveInstructorAction} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="locale" value={locale} />
            <Field label={l("Имя", "Есімі")} name="name" required />
            <Field label={l("Фото (URL)", "Фото (URL)")} name="photoUrl" />
            <Field label="Роль (RU)" name="roleRu" />
            <Field label="Рөлі (KZ)" name="roleKz" />
            <Field label={l("Опыт", "Тәжірибе")} name="experience" />
            <Field label={l("Языки", "Тілдер")} name="languages" />
            <div className="flex items-end gap-3 sm:col-span-2">
              <Toggle label={l("Активен", "Белсенді")} name="isActive" defaultChecked />
              <SubmitButton>{l("Добавить", "Қосу")}</SubmitButton>
            </div>
          </form>
        </Disclosure>
      </AdminCard>

      {/* VEHICLES */}
      <AdminCard title={t.admin.vehiclesEditor}>
        {vehicles.length === 0 ? (
          <p className="text-[0.8rem] text-[var(--color-faint)]">
            {l("Автомобили не добавлены — на сайте показывается галерея без выдуманных моделей.", "Көліктер қосылмаған — сайтта ойдан шығарылған модельдерсіз галерея көрсетіледі.")}
          </p>
        ) : (
          vehicles.map((vehicle) => (
            <Disclosure key={vehicle.id} summary={`${vehicle.make} ${vehicle.model}`} meta={vehicle.category ?? ""}>
              <form action={saveVehicleAction} className="grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={vehicle.id} />
                <input type="hidden" name="locale" value={locale} />
                <Field label={l("Марка", "Маркасы")} name="make" defaultValue={vehicle.make} required />
                <Field label={l("Модель", "Моделі")} name="model" defaultValue={vehicle.model} required />
                <Select
                  label={t.programs.transmission}
                  name="transmission"
                  defaultValue={vehicle.transmission ?? ""}
                  options={[
                    { value: "", label: "—" },
                    { value: "manual", label: t.fleet.transmissionManual },
                    { value: "automatic", label: t.fleet.transmissionAuto },
                  ]}
                />
                <Field label={t.programs.category} name="category" defaultValue={vehicle.category} />
                <Field label={l("Фото (URL)", "Фото (URL)")} name="photoUrl" defaultValue={vehicle.photoUrl} />
                <Field label={l("Порядок", "Реті")} name="sortOrder" type="number" defaultValue={vehicle.sortOrder} />
                <TextArea label={l("Особенности (RU)", "Ерекшеліктері (RU)")} name="featuresRu" defaultValue={vehicle.featuresRu} rows={2} />
                <TextArea label={l("Ерекшеліктері (KZ)", "Ерекшеліктері (KZ)")} name="featuresKz" defaultValue={vehicle.featuresKz} rows={2} />
                <div className="flex items-center gap-3 sm:col-span-2">
                  <Toggle label={l("Активен", "Белсенді")} name="isActive" defaultChecked={vehicle.isActive} />
                  <SubmitButton>{t.admin.save}</SubmitButton>
                  <DeleteForm action={deleteVehicleAction} id={vehicle.id} locale={locale} label={l("Удалить", "Жою")} />
                </div>
              </form>
            </Disclosure>
          ))
        )}
        <Disclosure summary={l("+ Добавить автомобиль", "+ Көлік қосу")}>
          <form action={saveVehicleAction} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="locale" value={locale} />
            <Field label={l("Марка", "Маркасы")} name="make" required />
            <Field label={l("Модель", "Моделі")} name="model" required />
            <Select
              label={t.programs.transmission}
              name="transmission"
              options={[
                { value: "", label: "—" },
                { value: "manual", label: t.fleet.transmissionManual },
                { value: "automatic", label: t.fleet.transmissionAuto },
              ]}
            />
            <Field label={t.programs.category} name="category" />
            <Field label={l("Фото (URL)", "Фото (URL)")} name="photoUrl" />
            <Field label={l("Порядок", "Реті")} name="sortOrder" type="number" defaultValue={vehicles.length + 1} />
            <div className="flex items-end gap-3 sm:col-span-2">
              <Toggle label={l("Активен", "Белсенді")} name="isActive" defaultChecked />
              <SubmitButton>{l("Добавить", "Қосу")}</SubmitButton>
            </div>
          </form>
        </Disclosure>
      </AdminCard>
    </div>
  );
}
