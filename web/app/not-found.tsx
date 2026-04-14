import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-wide flex flex-1 items-center justify-center py-16">
      <section className="w-full max-w-xl rounded-[var(--radius-card)] border border-slate-200 bg-white p-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-[color:var(--color-brand-primary)]">
          Страница не найдена
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Возможно, ссылка устарела. Перейдите в каталог и выберите автомобиль заново.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/cars"
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] bg-[color:var(--color-brand-accent)] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(220,38,38,0.35)] transition-colors hover:bg-[color:var(--color-brand-accent-hover)]"
          >
            В каталог
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] border border-slate-300 bg-white px-5 text-sm font-semibold text-[color:var(--color-brand-primary)] transition-colors hover:bg-slate-50"
          >
            На главную
          </Link>
        </div>
      </section>
    </main>
  );
}
