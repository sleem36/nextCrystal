import { formatCurrency } from "@/lib/format";

type DownPaymentRange = {
  from: number;
  to: number;
};

export function CarCreditPanel({
  monthlyPaymentRub,
  downPaymentRange,
  leadHref,
}: {
  monthlyPaymentRub: number;
  downPaymentRange?: DownPaymentRange;
  leadHref: string;
}) {
  return (
    <section className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-5">
      <h2 className="text-lg font-semibold text-[color:var(--color-brand-primary)]">Кредит</h2>
      <p className="mt-2 text-sm text-slate-600">
        Платёж от{" "}
        <span className="font-semibold text-slate-900">{formatCurrency(monthlyPaymentRub)}</span> /мес
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Первоначальный взнос:{" "}
        <span className="font-semibold text-slate-900">
          {downPaymentRange
            ? `${formatCurrency(downPaymentRange.from)} - ${formatCurrency(downPaymentRange.to)}`
            : "уточняется по заявке"}
        </span>
      </p>
      <a
        href={leadHref}
        className="mt-4 inline-flex h-11 items-center justify-center rounded-[var(--radius-button,0.5rem)] bg-[color:var(--color-brand-accent)] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(220,38,38,0.35)] transition-colors hover:bg-[color:var(--color-brand-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
      >
        Рассчитать кредит
      </a>
    </section>
  );
}
