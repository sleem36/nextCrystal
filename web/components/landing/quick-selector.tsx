"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OptionCard } from "@/components/ui/option-card";
import { CarBodyType } from "@/types/car";

export type TransmissionFilter = "any" | "automatic" | "manual";
export type DriveFilter = "any" | "fwd" | "rwd" | "awd";
export type FuelFilter = "any" | "petrol" | "diesel" | "hybrid" | "electric";

export type SelectorState = {
  monthlyBudget: number;
  maxPriceRub: number;
  bodyType: CarBodyType | "any";
  transmission: TransmissionFilter;
  city: string;
  drive: DriveFilter;
  fuel: FuelFilter;
  yearFrom: number;
  maxMileageKm: number;
};

type QuickSelectorProps = {
  value: SelectorState;
  onChange: (value: SelectorState) => void;
  onComplete: () => void;
};

export function QuickSelector({ value, onChange, onComplete }: QuickSelectorProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const bodyTypeOptions: Array<{ id: SelectorState["bodyType"]; label: string }> = [
    { id: "any", label: "Любой" },
    { id: "sedan", label: "Седан" },
    { id: "liftback", label: "Лифтбек" },
    { id: "hatchback", label: "Хэтчбек" },
    { id: "suv", label: "Кроссовер/SUV" },
  ];
  const transmissionOptions: Array<{ id: TransmissionFilter; label: string }> = [
    { id: "any", label: "Любая" },
    { id: "automatic", label: "Автомат" },
    { id: "manual", label: "Механика" },
  ];
  const cityOptions = [
    "Челябинск",
    "Тюмень",
    "Томск",
    "Омск",
    "Красноярск",
    "Сургут",
    "Новосибирск",
    "Новокузнецк",
    "Кемерово",
    "Барнаул",
    "Пермь",
    "Оренбург",
  ];
  const canContinue = useMemo(() => {
    if (step === 1) return value.monthlyBudget >= 15000;
    if (step === 2) return value.maxPriceRub >= 700000;
    if (step === 3) return Boolean(value.bodyType);
    if (step === 4) return Boolean(value.transmission);
    return Boolean(value.city);
  }, [step, value]);

  return (
    <Card className="space-y-4 p-4 md:space-y-5 md:p-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[color:var(--color-brand-primary)] md:text-xl">
          Быстрый подбор
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Шаг {step} из {totalSteps}: ответьте на вопросы и получите релевантную выдачу.
        </p>
      </div>
      {step === 1 ? (
        <>
          <Input
            label="1) Комфортный платеж в месяц, ₽"
            type="number"
            min={15000}
            step={1000}
            value={value.monthlyBudget}
            onChange={(event) =>
              onChange({
                ...value,
                monthlyBudget: Number(event.target.value),
              })
            }
          />
          <p className="-mt-2 text-xs text-slate-500">
            Рекомендуемый диапазон для подбора: 25 000 - 60 000 ₽/мес.
          </p>
        </>
      ) : null}
      {step === 2 ? (
        <>
          <Input
            label="2) Максимальный бюджет авто, ₽"
            type="number"
            min={700000}
            step={50000}
            value={value.maxPriceRub}
            onChange={(event) =>
              onChange({
                ...value,
                maxPriceRub: Number(event.target.value),
              })
            }
          />
          <p className="-mt-2 text-xs text-slate-500">
            Выдача учитывает и платеж в месяц, и общую стоимость авто.
          </p>
        </>
      ) : null}
      {step === 3 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">3) Тип кузова</p>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2" role="radiogroup" aria-label="Тип кузова">
            {bodyTypeOptions.map((item) => (
              <OptionCard
                key={item.id}
                label={item.label}
                selected={value.bodyType === item.id}
                onClick={() => onChange({ ...value, bodyType: item.id })}
              />
            ))}
          </div>
        </div>
      ) : null}
      {step === 4 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">4) Коробка передач</p>
          <div
            className="grid grid-cols-1 gap-2 md:grid-cols-2"
            role="radiogroup"
            aria-label="Коробка передач"
          >
            {transmissionOptions.map((item) => (
              <OptionCard
                key={item.id}
                label={item.label}
                selected={value.transmission === item.id}
                onClick={() => onChange({ ...value, transmission: item.id })}
              />
            ))}
          </div>
        </div>
      ) : null}
      {step === 5 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">5) Город</p>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2" role="radiogroup" aria-label="Город">
            {cityOptions.map((item) => (
              <OptionCard
                key={item}
                label={item}
                selected={value.city === item}
                onClick={() => onChange({ ...value, city: item })}
              />
            ))}
          </div>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {step > 1 ? (
          <Button variant="secondary" onClick={() => setStep((prev) => prev - 1)}>
            Назад
          </Button>
        ) : null}
        {step < totalSteps ? (
          <Button
            className="w-full sm:w-auto"
            disabled={!canContinue}
            onClick={() => setStep((prev) => prev + 1)}
          >
            Далее
          </Button>
        ) : (
          <Button className="w-full sm:w-auto" disabled={!canContinue} onClick={onComplete}>
            Показать подходящие варианты
          </Button>
        )}
      </div>
    </Card>
  );
}
