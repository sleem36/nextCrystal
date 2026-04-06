import Link from "next/link";

export default function CarDetailNotFound() {
  return (
    <div className="container-wide py-16 text-center">
      <h1 className="text-2xl font-semibold text-[color:var(--color-brand-primary)]">
        Автомобиль не найден
      </h1>
      <p className="mt-3 text-slate-600">
        Возможно, объявление снято с продажи. Загляните в каталог или оставьте заявку на подбор.
      </p>
      <Link
        href="/cars"
        className="mt-8 inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] bg-[color:var(--color-brand-accent)] px-6 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(220,38,38,0.35)] hover:bg-[color:var(--color-brand-accent-hover)]"
      >
        В каталог
      </Link>
    </div>
  );
}
