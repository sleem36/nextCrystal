import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Aurora Auto",
  description: "Ответы на частые вопросы о покупке, кредитовании и проверке автомобилей.",
};

const faqItems = [
  {
    q: "Можно ли купить автомобиль без первого взноса?",
    a: "Да, в кредитном калькуляторе можно выбрать первоначальный взнос от 0 ₽. Финальные условия зависят от банка.",
  },
  {
    q: "Как проверить юридическую чистоту авто?",
    a: "Перед продажей мы проверяем VIN, ограничения и историю владения. Ключевые данные показываем в карточке авто.",
  },
  {
    q: "Сколько времени занимает оформление?",
    a: "Обычно от одного дня. Точный срок зависит от выбранного способа покупки и банка.",
  },
];

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main className="container-wide flex-1 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <section className="space-y-4 rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-2xl font-semibold text-[color:var(--color-brand-primary)]">FAQ</h1>
        <div className="space-y-2">
          {faqItems.map((item) => (
            <details key={item.q} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-900">{item.q}</summary>
              <p className="mt-2 text-sm text-slate-700">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
