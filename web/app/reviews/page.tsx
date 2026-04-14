import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Отзывы клиентов — Crystal Motors",
  description: "Реальные отзывы клиентов о покупке автомобилей с пробегом в Crystal Motors.",
};

const reviews = [
  { name: "Алексей, Барнаул", text: "Подобрали авто за день, помогли с кредитом и оформлением." },
  { name: "Ольга, Новосибирск", text: "Понравилась прозрачная история авто и быстрый выход на сделку." },
  { name: "Илья, Кемерово", text: "Сделка без сюрпризов, всё как обещали в каталоге." },
];

export default function ReviewsPage() {
  return (
    <main className="container-wide flex-1 py-8">
      <section className="space-y-4 rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-2xl font-semibold text-[color:var(--color-brand-primary)]">Отзывы клиентов</h1>
        <div className="grid gap-3 md:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-900">{review.name}</p>
              <p className="mt-1 text-sm text-slate-700">{review.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
