"use client";

import { useMemo, useState } from "react";
import { LeadForm } from "@/components/landing/lead-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { METRIKA_GOALS, trackGoal } from "@/lib/analytics";
import { formatCurrency } from "@/lib/format";
import type { CarBodyType, Car } from "@/types/car";

type BuyIntentType = "credit" | "cash";
const CREDIT_TERM_MIN_YEARS = 1;
const CREDIT_TERM_MAX_YEARS = 8;
const DOWN_PAYMENT_STEP = 10_000;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function CarBuyIntentControls({
  car,
  utm,
  paymentMethod = "credit",
}: {
  car: Car;
  utm: Record<string, string>;
  paymentMethod?: BuyIntentType;
}) {
  const metrikaId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || 0) || undefined;
  const [leadType, setLeadType] = useState<BuyIntentType | null>(null);
  const [downPayment, setDownPayment] = useState(0);
  const [creditTermYears, setCreditTermYears] = useState(5);
  const annualRatePct = Number(process.env.NEXT_PUBLIC_CREDIT_ANNUAL_RATE_PCT || 16);

  const creditTermMonths = creditTermYears * 12;
  const estimatedMonthlyPayment = useMemo(() => {
    const principal = Math.max(0, car.priceRub - downPayment);
    if (!Number.isFinite(principal) || !Number.isFinite(creditTermMonths) || creditTermMonths <= 0) {
      return 0;
    }
    if (principal === 0) {
      return 0;
    }
    const monthlyRate = Math.max(0, annualRatePct) / 100 / 12;
    if (monthlyRate === 0) {
      return Math.round(principal / creditTermMonths);
    }
    const pow = Math.pow(1 + monthlyRate, creditTermMonths);
    const denominator = pow - 1;
    if (!Number.isFinite(pow) || !Number.isFinite(denominator) || denominator <= 0) {
      return 0;
    }
    const payment = principal * ((monthlyRate * pow) / denominator);
    return Number.isFinite(payment) ? Math.round(payment) : 0;
  }, [annualRatePct, car.priceRub, creditTermMonths, downPayment]);

  const context = useMemo(() => {
    if (!leadType) return null;
    return {
      city: car.city,
      carId: car.id,
      paymentMethod: leadType,
      monthlyBudget: leadType === "credit" ? car.monthlyPaymentRub : undefined,
      maxPriceRub: car.priceRub,
      bodyType: car.bodyType as CarBodyType | "any",
      transmission: car.transmission,
      drive: car.drive,
      fuel: car.fuel,
      yearFrom: car.year,
      maxMileageKm: car.mileageKm,
      purchaseGoal: leadType === "credit" ? "buy_intent_credit" : "buy_intent_cash",
      leadSource: leadType === "credit" ? "credit_calculator" : "buy_intent_cash",
      carTitle: `${car.brand} ${car.model}, ${car.year}`,
      carUrl: `/cars/${car.id}`,
      downPayment: leadType === "credit" ? downPayment : undefined,
      creditTermMonths: leadType === "credit" ? creditTermMonths : undefined,
      estimatedMonthlyPayment: leadType === "credit" ? estimatedMonthlyPayment : undefined,
      utm,
    };
  }, [car, leadType, utm, downPayment, creditTermMonths, estimatedMonthlyPayment]);

  const openLead = (type: BuyIntentType) => {
    trackGoal(metrikaId, METRIKA_GOALS.clickWantToBuy, {
      carId: car.id,
      city: car.city,
      priceRub: car.priceRub,
    });
    if (type === "credit") {
      trackGoal(metrikaId, METRIKA_GOALS.selectBuyOptionCredit, { carId: car.id, city: car.city });
      trackGoal(metrikaId, METRIKA_GOALS.openCreditCalculator, { carId: car.id, city: car.city });
      trackGoal(metrikaId, METRIKA_GOALS.openFormCredit, { carId: car.id, city: car.city });
    } else {
      trackGoal(metrikaId, METRIKA_GOALS.selectBuyOptionCash, { carId: car.id, city: car.city });
      trackGoal(metrikaId, METRIKA_GOALS.openFormCash, { carId: car.id, city: car.city });
    }
    setLeadType(type);
  };

  const onDownPaymentInput = (value: string) => {
    const parsed = Number(value.replace(/\s/g, ""));
    const safe = Number.isFinite(parsed) ? parsed : 0;
    const rounded = Math.round(safe / DOWN_PAYMENT_STEP) * DOWN_PAYMENT_STEP;
    const next = clamp(rounded, 0, car.priceRub);
    setDownPayment(next);
    trackGoal(metrikaId, METRIKA_GOALS.changeDownPayment, {
      carId: car.id,
      value: next,
    });
  };

  const onTermInput = (value: string) => {
    const parsed = Number(value);
    const safe = Number.isFinite(parsed) ? parsed : CREDIT_TERM_MIN_YEARS;
    const next = clamp(Math.round(safe), CREDIT_TERM_MIN_YEARS, CREDIT_TERM_MAX_YEARS);
    setCreditTermYears(next);
    trackGoal(metrikaId, METRIKA_GOALS.changeCreditTerm, {
      carId: car.id,
      years: next,
      months: next * 12,
    });
  };

  return (
    <>
      <Button type="button" className="w-full px-6" onClick={() => openLead(paymentMethod)}>
        Заявка на покупку в кредит
      </Button>

      <Modal
        open={leadType != null}
        onClose={() => setLeadType(null)}
        title={leadType === "credit" ? "Заявка на покупку в кредит" : "Заявка по программе Trade-in"}
        description={`${car.brand} ${car.model}, ${car.year}`}
      >
        {context ? (
          <div className="space-y-4">
            {leadType === "credit" ? (
              <div className="space-y-4 rounded-[var(--radius-card)] border border-slate-200 bg-slate-50/80 p-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-600">Первоначальный взнос</p>
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="number"
                      min={0}
                      max={car.priceRub}
                      step={DOWN_PAYMENT_STEP}
                      value={downPayment}
                      onChange={(event) => onDownPaymentInput(event.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900"
                    />
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      до {formatCurrency(car.priceRub)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={car.priceRub}
                    step={DOWN_PAYMENT_STEP}
                    value={downPayment}
                    onChange={(event) => onDownPaymentInput(event.target.value)}
                    className="w-full accent-[color:var(--color-brand-accent)]"
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-600">Срок кредита</p>
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="number"
                      min={CREDIT_TERM_MIN_YEARS}
                      max={CREDIT_TERM_MAX_YEARS}
                      step={1}
                      value={creditTermYears}
                      onChange={(event) => onTermInput(event.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900"
                    />
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {creditTermMonths} мес.
                    </span>
                  </div>
                  <input
                    type="range"
                    min={CREDIT_TERM_MIN_YEARS}
                    max={CREDIT_TERM_MAX_YEARS}
                    step={1}
                    value={creditTermYears}
                    onChange={(event) => onTermInput(event.target.value)}
                    className="w-full accent-[color:var(--color-brand-accent)]"
                  />
                </div>

                <p className="text-sm font-semibold text-slate-900">
                  Платеж: от {formatCurrency(estimatedMonthlyPayment)} / мес
                </p>
                <p className="text-xs text-slate-500">
                  Расчет ориентировочный, не является публичной офертой.
                </p>
              </div>
            ) : null}

            <LeadForm
              context={context}
              variant="plain"
              hideTitle
              leadType={leadType === "credit" ? "credit_calculator" : "cash"}
              submitLabel="Подать заявку"
              onSuccess={() => setLeadType(null)}
            />

            <Button type="button" variant="secondary" className="w-full" onClick={() => setLeadType(null)}>
              Не сейчас
            </Button>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
