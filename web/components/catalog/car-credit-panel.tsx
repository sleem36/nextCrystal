"use client";

import { useMemo, useState } from "react";
import { LeadForm } from "@/components/landing/lead-form";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/format";
import type { Car } from "@/types/car";

type DownPaymentRange = {
  from: number;
  to: number;
};

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
  const [downPayment, setDownPayment] = useState(() =>
    Math.min(maxDownPayment, Math.max(minDownPayment, Math.round(priceRub * 0.2))),
  );
  const [termMonths, setTermMonths] = useState(60);
  const [annualRate, setAnnualRate] = useState(17);

  const clampedDownPayment = Math.min(maxDownPayment, Math.max(minDownPayment, downPayment));
  const principal = Math.max(0, priceRub - clampedDownPayment);

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

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm text-slate-700">
          <span className="font-medium">Первоначальный взнос, ₽</span>
          <input
            type="number"
            min={minDownPayment}
            max={maxDownPayment}
            step={10000}
            value={clampedDownPayment}
            onChange={(e) => setDownPayment(Number(e.target.value) || 0)}
            className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
          />
          <span className="text-xs text-slate-500">
            Диапазон: {formatCurrency(minDownPayment)} - {formatCurrency(maxDownPayment)}
          </span>
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700">
          <span className="font-medium">Срок, месяцев</span>
          <input
            type="number"
            min={12}
            max={96}
            step={12}
            value={termMonths}
            onChange={(e) => setTermMonths(Math.max(12, Math.min(96, Number(e.target.value) || 12)))}
            className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700">
          <span className="font-medium">Ставка, % годовых</span>
          <input
            type="number"
            min={1}
            max={40}
            step={0.1}
            value={annualRate}
            onChange={(e) => setAnnualRate(Math.max(1, Math.min(40, Number(e.target.value) || 1)))}
            className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
          />
        </label>
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

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-button,0.5rem)] bg-[color:var(--color-brand-accent)] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(220,38,38,0.35)] transition-colors hover:bg-[color:var(--color-brand-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2 md:w-auto"
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
