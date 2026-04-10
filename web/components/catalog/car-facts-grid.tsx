type FactItem = {
  label: string;
  value: string;
};

export function CarFactsGrid({ facts }: { facts: FactItem[] }) {
  if (facts.length === 0) return null;

  return (
    <section className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Ключевые факты</h2>
      <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
        {facts.map((item) => (
          <div key={item.label} className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-xs text-slate-500">{item.label}</dt>
            <dd className="font-semibold text-slate-900">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
