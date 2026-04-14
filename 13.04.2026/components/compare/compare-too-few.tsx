import Link from "next/link";

export function CompareTooFew() {
  return (
    <div className="container-wide space-y-4 py-10 md:py-14">
      <h1 className="text-2xl font-semibold text-[color:var(--color-brand-primary)] md:text-3xl">
        Сравнение автомобилей
      </h1>
      <div className="rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
        <p className="font-medium">Нужно минимум два автомобиля</p>
        <p className="mt-2 text-amber-900/90">
          Если вы уже отметили авто в каталоге, страница подставит их из сохранённого выбора (подождите секунду).
          Или откройте каталог, отметьте «Сравнить» у двух или трёх авто и нажмите плавающую кнопку «Сравнить»
          — либо перейдите по ссылке вида{" "}
          <code className="rounded bg-white/80 px-1 py-0.5 text-xs">
            /compare?ids=id1,id2
          </code>
          .
        </p>
      </div>
      <Link
        href="/cars"
        className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] bg-[color:var(--color-brand-accent)] px-6 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(220,38,38,0.35)] hover:bg-[color:var(--color-brand-accent-hover)]"
      >
        В каталог
      </Link>
    </div>
  );
}
