"use client";

import { useMemo, useState, type ReactNode } from "react";
import { LeadForm } from "@/components/landing/lead-form";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/format";
import type { Car } from "@/types/car";

type DownPaymentRange = {
  from: number;
  to: number;
};

const TERM_MIN = 12;
const TERM_MAX = 96;
const TERM_STEP = 12;
const RATE_MIN = 1;
const RATE_MAX = 40;
const RATE_SLIDER_STEP = 0.1;

function linearPct(value: number, min: number, max: number): number {
  const span = max - min;
  if (span <= 0) return 0;
  return Math.min(100, Math.max(0, ((value - min) / span) * 100));
}

/** Шаг ползунка взноса: мелкий, чтобы пресеты «10%» не давали «11%» после округления крупным шагом */
const DOWN_SLIDER_STEP = 1000;

type SliderFieldProps = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
  hintLeft: string;
  hintRight: string;
  children?: ReactNode;
};

function CreditSliderField({
  label,
  min,
  max,
  step,
  value,
  onChange,
  disabled,
  hintLeft,
  hintRight,
  children,
}: SliderFieldProps) {
  const pct = linearPct(value, min, max);
  return (
    <div className="flex flex-col gap-2 text-sm text-slate-700">
      <span className="font-medium">{label}</span>
      <div className="credit-calculator-range relative h-10">
        <div
          className="pointer-events-none absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-[color:var(--color-brand-accent)]/90 transition-[width] duration-150 ease-out"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute left-0 right-0 top-1/2 z-[2] w-full -translate-y-1/2 cursor-pointer"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>
      <div className="flex justify-between text-[11px] text-slate-500">
        <span>{hintLeft}</span>
        <span>{hintRight}</span>
      </div>
      {children}
    </div>
  );
}

export function CarCreditPanel({
  priceRub,
  monthlyPaymentRub,
  downPaymentRange,
  car,
  utm,
}: {
  priceRub: number;
  monthlyPaymentRub: number;
  downPaymentRange?: DownPaymentRange;
  car: Car;
  utm: Record<string, string>;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const minDownPayment = Math.max(0, downPaymentRange?.from ?? 0);
  const maxDownPayment = Math.max(minDownPayment, downPaymentRange?.to ?? Math.round(priceRub * 0.5));
  const downSpan = maxDownPayment - minDownPayment;

  const [downPayment, setDownPayment] = useState(() =>
    Math.min(maxDownPayment, Math.max(minDownPayment, Math.round(priceRub * 0.2))),
  );
  const [termMonths, setTermMonths] = useState(60);
  const [annualRate, setAnnualRate] = useState(17);

  const clampedDownPayment = Math.min(
    maxDownPayment,
    Math.max(minDownPayment, Math.round(downPayment)),
  );
  const principal = Math.max(0, priceRub - clampedDownPayment);
  const downPercentLabel =
    priceRub > 0
      ? (Math.round((clampedDownPayment / priceRub) * 1000) / 10).toLocaleString("ru-RU", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 1,
        })
      : "0";

  const calc = useMemo(() => {
    if (principal <= 0 || termMonths <= 0) {
      return { monthly: 0, total: 0, overpayment: 0 };
    }
    const monthlyRate = annualRate / 12 / 100;
    if (monthlyRate <= 0) {
      const monthly = Math.round(principal / termMonths);
      const total = monthly * termMonths;
      return { monthly, total, overpayment: Math.max(0, total - principal) };
    }
    const k = (monthlyRate * (1 + monthlyRate) ** termMonths) / ((1 + monthlyRate) ** termMonths - 1);
    const monthly = Math.round(principal * k);
    const total = monthly * termMonths;
    const overpayment = Math.max(0, total - principal);
    return { monthly, total, overpayment };
  }, [annualRate, principal, termMonths]);

  const leadContext = useMemo(
    () => ({
      city: car.city,
      carId: car.id,
      paymentMethod: "credit" as const,
      monthlyBudget: calc.monthly > 0 ? calc.monthly : monthlyPaymentRub,
      maxPriceRub: car.priceRub,
      bodyType: car.bodyType,
      transmission: car.transmission,
      drive: car.drive,
      fuel: car.fuel,
      yearFrom: car.year,
      maxMileageKm: car.mileageKm,
      purchaseGoal: "credit_calculator",
      carTitle: `${car.brand} ${car.model}, ${car.year}`,
      carUrl: `/cars/${car.id}`,
      downPayment: clampedDownPayment,
      creditTermMonths: termMonths,
      estimatedMonthlyPayment: calc.monthly,
      utm,
    }),
    [car, calc.monthly, clampedDownPayment, monthlyPaymentRub, termMonths, utm],
  );

  const applyDownPercent = (pct: number) => {
    const raw = Math.round((priceRub * pct) / 100);
    setDownPayment(Math.min(maxDownPayment, Math.max(minDownPayment, raw)));
  };

  const activePresetPct = useMemo(() => {
    if (priceRub <= 0 || downSpan <= 0) return null;
    for (const pct of [10, 20, 30] as const) {
      const raw = Math.round((priceRub * pct) / 100);
      const target = Math.min(maxDownPayment, Math.max(minDownPayment, raw));
      if (clampedDownPayment === target) return pct;
    }
    return null;
  }, [clampedDownPayment, downSpan, maxDownPayment, minDownPayment, priceRub]);

  return (
    <section className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--color-brand-primary)]">Кредитный калькулятор</h2>
          <p className="mt-1 text-sm text-slate-600">
            Базовый платёж по карточке:{" "}
            <span className="font-semibold text-slate-900">{formatCurrency(monthlyPaymentRub)}</span> /мес
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
          <p className="text-xs text-slate-500">Платёж по калькулятору</p>
          <p className="text-xl font-semibold text-slate-900">{formatCurrency(calc.monthly)} /мес</p>
        </div>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-3">
        <CreditSliderField
          label="Первоначальный взнос"
          min={minDownPayment}
          max={maxDownPayment}
          step={DOWN_SLIDER_STEP}
          value={clampedDownPayment}
          onChange={(n) =>
            setDownPayment(Math.min(maxDownPayment, Math.max(minDownPayment, Math.round(n))))
          }
          disabled={downSpan <= 0}
          hintLeft={formatCurrency(minDownPayment)}
          hintRight={formatCurrency(maxDownPayment)}
        >
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="number"
              min={minDownPayment}
              max={maxDownPayment}
              step={1000}
              value={clampedDownPayment}
              onChange={(e) => setDownPayment(Number(e.target.value) || minDownPayment)}
              disabled={downSpan <= 0}
              className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2 disabled:opacity-60"
              aria-label="Первоначальный взнос в рублях"
            />
            <span className="shrink-0 text-xs text-slate-500">{downPercentLabel}% от цены</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1" role="group" aria-label="Доля первоначального взноса">
            {[10, 20, 30].map((pct) => {
              const selected = activePresetPct === pct;
              return (
                <button
                  key={pct}
                  type="button"
                  onClick={() => applyDownPercent(pct)}
                  disabled={downSpan <= 0}
                  aria-pressed={selected}
                  className={
                    selected
                      ? "rounded-lg border border-[color:var(--color-brand-accent)] bg-[color:var(--color-brand-accent)] px-2 py-1 text-xs font-semibold text-white shadow-[0_1px_2px_rgba(0,118,234,0.35)] transition disabled:cursor-not-allowed disabled:opacity-50"
                      : "rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 transition hover:border-[color:var(--color-brand-accent)] hover:bg-white hover:text-[color:var(--color-brand-accent)] disabled:cursor-not-allowed disabled:opacity-50"
                  }
                >
                  {pct}%
                </button>
              );
            })}
          </div>
        </CreditSliderField>

        <CreditSliderField
          label="Срок кредита"
          min={TERM_MIN}
          max={TERM_MAX}
          step={TERM_STEP}
          value={termMonths}
          onChange={(n) =>
            setTermMonths(Math.max(TERM_MIN, Math.min(TERM_MAX, Math.round(n / TERM_STEP) * TERM_STEP)))
          }
          hintLeft={`${TERM_MIN} мес`}
          hintRight={`${TERM_MAX} мес`}
        >
          <input
            type="number"
            min={TERM_MIN}
            max={TERM_MAX}
            step={TERM_STEP}
            value={termMonths}
            onChange={(e) =>
              setTermMonths(
                Math.max(TERM_MIN, Math.min(TERM_MAX, Number(e.target.value) || TERM_MIN)),
              )
            }
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
            aria-label="Срок в месяцах"
          />
        </CreditSliderField>

        <CreditSliderField
          label="Ставка, % годовых"
          min={RATE_MIN}
          max={RATE_MAX}
          step={RATE_SLIDER_STEP}
          value={Math.min(RATE_MAX, Math.max(RATE_MIN, Math.round(annualRate * 10) / 10))}
          onChange={(n) => setAnnualRate(Math.max(RATE_MIN, Math.min(RATE_MAX, Math.round(n * 10) / 10)))}
          hintLeft={`${RATE_MIN}%`}
          hintRight={`${RATE_MAX}%`}
        >
          <input
            type="number"
            min={RATE_MIN}
            max={RATE_MAX}
            step={0.1}
            value={annualRate}
            onChange={(e) =>
              setAnnualRate(Math.max(RATE_MIN, Math.min(RATE_MAX, Number(e.target.value) || RATE_MIN)))
            }
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
            aria-label="Процентная ставка годовых"
          />
        </CreditSliderField>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-700 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-xs text-slate-500">Сумма кредита</p>
          <p className="font-semibold text-slate-900">{formatCurrency(principal)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-xs text-slate-500">Переплата</p>
          <p className="font-semibold text-slate-900">{formatCurrency(calc.overpayment)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-xs text-slate-500">Итого к выплате</p>
          <p className="font-semibold text-slate-900">{formatCurrency(calc.total)}</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Расчёт ориентировочный. Итоговые условия зависят от банка и вашей заявки.
      </p>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="btn-hover-primary mt-4 inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-button,0.5rem)] bg-[color:var(--color-brand-accent)] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,118,234,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2 md:w-auto"
      >
        Рассчитать кредит
      </button>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Заявка на кредит"
        description={`${car.brand} ${car.model}, ${car.year}. Оставьте телефон — менеджер свяжется и уточнит условия.`}
      >
        <LeadForm
          context={leadContext}
          variant="plain"
          hideTitle
          leadType="credit_calculator"
          submitLabel="Отправить заявку"
          onSuccess={() => setModalOpen(false)}
        />
      </Modal>
    </section>
  );
}
