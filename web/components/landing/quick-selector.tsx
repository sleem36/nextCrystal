"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CarBodyType, CarTag } from "@/types/car";

export type SelectorState = {
  monthlyBudget: number;
  maxPriceRub: number;
  bodyType: CarBodyType | "any";
  city: string;
  purchaseGoal: CarTag;
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
  const cityOptions = ["Барнаул", "Новосибирск", "Томск", "Кемерово"];
  const goalOptions: Array<{ id: SelectorState["purchaseGoal"]; label: string }> = [
    { id: "family", label: "Для семьи" },
    { id: "first-car", label: "Первый авто" },
    { id: "city", label: "На каждый день" },
    { id: "comfort", label: "Комфорт и класс выше" },
  ];
  const canContinue = useMemo(() => {
    if (step === 1) return value.monthlyBudget >= 15000;
    if (step === 2) return value.maxPriceRub >= 700000;
    if (step === 3) return Boolean(value.bodyType);
    if (step === 4) return Boolean(value.city);
    return Boolean(value.purchaseGoal);
  }, [step, value]);

  return (
    <Card className="space-y-5 p-5 md:p-6" id="quick-selector">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Быстрый подбор
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Шаг {step} из {totalSteps}: ответьте на 5 вопросов и получите релевантную выдачу.
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {bodyTypeOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  value.bodyType === item.id
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => onChange({ ...value, bodyType: item.id })}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {step === 4 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">4) Город</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {cityOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  value.city === item
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => onChange({ ...value, city: item })}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {step === 5 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">5) Цель покупки</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {goalOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  value.purchaseGoal === item.id
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => onChange({ ...value, purchaseGoal: item.id })}
              >
                {item.label}
              </button>
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
