export function TradeInCtaPanel({ leadHref }: { leadHref: string }) {
  return (
    <section className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-5">
      <h2 className="text-lg font-semibold text-[color:var(--color-brand-primary)]">Оценка вашего авто</h2>
      <p className="mt-2 text-sm text-slate-600">
        Узнайте ориентировочную стоимость вашего автомобиля и сравните с текущим предложением по этому
        авто.
      </p>
      <a
        href={leadHref}
        className="mt-4 inline-flex h-11 items-center justify-center rounded-[var(--radius-button,0.5rem)] border border-slate-300 bg-white px-5 text-sm font-semibold text-[color:var(--color-brand-primary)] transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
      >
        Получить оценку онлайн
      </a>
    </section>
  );
}
