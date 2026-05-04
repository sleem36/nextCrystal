export function TradeInCtaPanel({ leadHref }: { leadHref: string }) {
  return (
    <section className="flex h-full min-h-0 flex-col rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-5">
      <h2 className="text-lg font-semibold text-[color:var(--color-brand-primary)]">Оценка вашего авто</h2>
      <p className="mt-2 text-sm text-slate-600">
        Оценим ваш автомобиль и поможем понять, как он может уменьшить доплату по текущему предложению.
      </p>
      <div className="mt-auto pt-4">
        <a
          href={leadHref}
          className="btn-hover-secondary inline-flex h-11 items-center justify-center rounded-[var(--radius-button,0.5rem)] border border-slate-300 bg-white px-5 text-sm font-semibold text-[color:var(--color-brand-primary)] hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
        >
          Оценить мой автомобиль
        </a>
      </div>
    </section>
  );
}
