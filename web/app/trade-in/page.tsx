import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trade-in — Crystal Motors",
  description: "Оценка вашего автомобиля и обмен по программе Trade-in в Crystal Motors.",
};

export default function TradeInPage() {
  return (
    <main className="container-wide flex-1 py-8">
      <section className="space-y-3 rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-2xl font-semibold text-[color:var(--color-brand-primary)]">Trade-in</h1>
        <p className="text-sm text-slate-600">
          Оценим ваш автомобиль и зачтем его стоимость при покупке авто из каталога.
        </p>
        <Link
          href="/cars"
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] bg-[color:var(--color-brand-accent)] px-5 text-sm font-semibold text-white"
        >
          Выбрать авто для обмена
        </Link>
      </section>
    </main>
  );
}
