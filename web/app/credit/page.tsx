import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Авто в кредит — Aurora Auto",
  description: "Условия автокредита, примерные ставки и порядок подачи заявки в Aurora Auto.",
};

export default function CreditPage() {
  return (
    <main className="container-wide flex-1 py-8">
      <section className="space-y-4 rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-2xl font-semibold text-[color:var(--color-brand-primary)]">Авто в кредит</h1>
        <p className="text-sm text-slate-600">
          Подберите автомобиль и отправьте заявку с предварительным расчетом ежемесячного платежа прямо в
          карточке авто.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Срок кредитования: от 1 до 8 лет.</li>
          <li>Первоначальный взнос: от 0 ₽.</li>
          <li>Решение банка обычно в день обращения.</li>
        </ul>
        <div className="pt-2">
          <Link
            href="/cars"
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] bg-[color:var(--color-brand-accent)] px-5 text-sm font-semibold text-white"
          >
            Перейти в каталог
          </Link>
        </div>
      </section>
    </main>
  );
}
