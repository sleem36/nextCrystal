"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";
import { estimateMonthlyPaymentRub } from "@/lib/catalog-credit-preview";

const TERM_OPTIONS = [36, 48, 60] as const;
const DEFAULT_ANNUAL_RATE = 17;
const DOWN_PAYMENT_SHARE = 0.2;

type CatalogMiniCreditProps = {
  priceRub: number;
};

export function CatalogMiniCredit({ priceRub }: CatalogMiniCreditProps) {
  const [termMonths, setTermMonths] = useState<(typeof TERM_OPTIONS)[number]>(60);
  const downPaymentRub = Math.round(priceRub * DOWN_PAYMENT_SHARE);

  const monthly = useMemo(
    () =>
      estimateMonthlyPaymentRub({
        priceRub,
        downPaymentRub,
        termMonths,
        annualRatePercent: DEFAULT_ANNUAL_RATE,
      }),
    [downPaymentRub, priceRub, termMonths],
  );

  return (
    <div
      data-no-card-nav
      className="rounded-xl border border-[color:var(--border-soft)] bg-[color:var(--surface-card-muted)]/90 px-3 py-2.5"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-[color:var(--text-soft)]">Примерный платёж</p>
          <p className="text-base font-bold tabular-nums text-[color:var(--color-brand-accent)] md:text-lg">
            {formatCurrency(monthly)} <span className="text-xs font-semibold text-[color:var(--text-muted)]">/мес</span>
          </p>
        </div>
        <label className="flex flex-col gap-0.5 text-[11px] text-[color:var(--text-muted)]">
          <span className="font-medium">Срок</span>
          <select
            className="h-9 min-w-[5.5rem] rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] px-2 text-sm font-medium text-[color:var(--text-strong)]"
            value={termMonths}
            onChange={(e) => setTermMonths(Number(e.target.value) as (typeof TERM_OPTIONS)[number])}
            aria-label="Срок кредита в месяцах"
          >
            {TERM_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m} мес.
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-1.5 text-[10px] leading-snug text-[color:var(--text-soft)]">
        Взнос {Math.round(DOWN_PAYMENT_SHARE * 100)}%, ставка {DEFAULT_ANNUAL_RATE}% годовых — ориентир, не оферта банка.
      </p>
    </div>
  );
}
