import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Условия покупки — Crystal Motors",
  description: "Условия покупки, оплаты и передачи автомобиля в Crystal Motors.",
};

export default function PurchaseTermsPage() {
  return (
    <main className="container-wide flex-1 py-8">
      <section className="space-y-3 rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-2xl font-semibold text-[color:var(--color-brand-primary)]">Условия покупки</h1>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Покупка возможна за собственные средства или в кредит.</li>
          <li>Условия и ставки уточняются индивидуально после одобрения банка.</li>
          <li>Передача автомобиля после подписания документов и оплаты.</li>
        </ul>
      </section>
    </main>
  );
}
