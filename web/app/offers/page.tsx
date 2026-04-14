import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Акции и спецпредложения — Aurora Auto",
  description: "Актуальные акции и специальные предложения на автомобили с пробегом.",
};

export default function OffersPage() {
  return (
    <main className="container-wide flex-1 py-8">
      <section className="space-y-3 rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-2xl font-semibold text-[color:var(--color-brand-primary)]">Акции</h1>
        <p className="text-sm text-slate-600">
          Раздел для специальных предложений. В MVP доступны акции по выбранным позициям из каталога.
        </p>
      </section>
    </main>
  );
}
