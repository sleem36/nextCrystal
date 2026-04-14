import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Выкуп авто — Crystal Motors",
  description: "Оставьте заявку на выкуп автомобиля в Crystal Motors.",
};

export default function BuyoutPage() {
  return (
    <main className="container-wide flex-1 py-8">
      <section className="space-y-3 rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-2xl font-semibold text-[color:var(--color-brand-primary)]">Выкуп авто</h1>
        <p className="text-sm text-slate-600">
          Заполните короткую заявку, и мы предложим ориентировочную цену выкупа вашего автомобиля.
        </p>
      </section>
    </main>
  );
}
