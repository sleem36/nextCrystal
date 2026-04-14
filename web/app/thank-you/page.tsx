import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Спасибо за заявку — Aurora Auto",
  description: "Заявка принята. Менеджер Aurora Auto свяжется с вами в ближайшее время.",
};

export default function ThankYouPage() {
  return (
    <main className="container-wide flex flex-1 items-center justify-center py-12">
      <section className="w-full max-w-xl rounded-[var(--radius-card)] border border-slate-200 bg-white p-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-2xl font-semibold text-[color:var(--color-brand-primary)]">Спасибо за заявку</h1>
        <p className="mt-2 text-sm text-slate-600">
          Мы получили ваши данные. Менеджер свяжется с вами в ближайшее время.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/cars"
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] bg-[color:var(--color-brand-accent)] px-5 text-sm font-semibold text-white"
          >
            Продолжить в каталоге
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] border border-slate-300 bg-white px-5 text-sm font-semibold text-[color:var(--color-brand-primary)]"
          >
            На главную
          </Link>
        </div>
      </section>
    </main>
  );
}
