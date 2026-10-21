import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70dvh] items-center justify-center px-4 py-20">
      <div className="max-w-[30rem] text-center">
        <p className="eyebrow">404</p>
        <h1 className="display display-m mt-3">Страница не найдена</h1>
        <p className="mt-2 text-[0.85rem] text-[var(--color-muted)]">Бет табылмады</p>
        <p className="body-muted mt-4 text-[0.9rem]">
          Возможно, ссылка устарела. Вернитесь на главную или запишитесь на консультацию.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/ru" className="btn btn-primary btn-sm">
            На главную
          </Link>
          <Link href="/ru/contacts" className="btn btn-ghost btn-sm">
            Контакты
          </Link>
        </div>
      </div>
    </div>
  );
}
