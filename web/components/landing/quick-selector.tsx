"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OptionCard } from "@/components/ui/option-card";
import { CarBodyType } from "@/types/car";

export type TransmissionFilter = "any" | "automatic" | "manual";
export type DriveFilter = "any" | "fwd" | "rwd" | "awd";
export type FuelFilter = "any" | "petrol" | "diesel" | "hybrid" | "electric";
export type PaymentMethod = "credit" | "cash";

export type SelectorState = {
  paymentMethod: PaymentMethod;
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
  /** Ссылка «в каталог без подбора» (например /cars + UTM) */
  skipCatalogHref?: string;
  onSkipCatalog?: () => void;
};

const chipBase =
  "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2";

function chipActive(active: boolean) {
  return active
    ? "border-[color:var(--color-brand-accent)] bg-[color:var(--color-brand-accent)]/10 text-[color:var(--color-brand-accent)]"
    : "border-slate-200 bg-white text-slate-800 hover:border-slate-300";
}

function formatPricePresetRub(n: number): string {
  if (n < 1_000_000) {
    return `${Math.round(n / 1000).toLocaleString("ru-RU")} тыс ₽`;
  }
  const millions = n / 1_000_000;
  const rounded = Math.round(millions * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
  return `${text} млн ₽`;
}

export function QuickSelector({
  value,
  onChange,
  onComplete,
  skipCatalogHref,
  onSkipCatalog,
}: QuickSelectorProps) {
  const isCredit = value.paymentMethod === "credit";
  const monthlyPresets = [15000, 25000, 35000, 45000, 55000];
  const maxPricePresetsCredit = [1_000_000, 1_500_000, 2_000_000, 2_500_000, 3_000_000];
  const maxPricePresetsCash = [700_000, 1_000_000, 1_500_000, 2_000_000, 2_500_000];

  const canSubmit = useMemo(() => {
    if (!value.city.trim()) return false;
    if (isCredit) {
      return value.monthlyBudget >= 15000 && value.maxPriceRub >= 700_000;
    }
    return value.maxPriceRub >= 700_000;
  }, [isCredit, value.city, value.maxPriceRub, value.monthlyBudget]);

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

  const paymentMethodOptions: Array<{ id: PaymentMethod; label: string }> = [
    { id: "credit", label: "Кредит" },
    { id: "cash", label: "Trade-in" },
  ];

  return (
    <Card className="space-y-4 p-4 md:space-y-5 md:p-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[color:var(--color-brand-primary)] md:text-xl">
          Быстрый подбор
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Обычно занимает меньше минуты: выберите сценарий и бюджет — сразу покажем подходящие варианты.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Как хотите купить?</p>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2" role="radiogroup" aria-label="Способ оплаты">
          {paymentMethodOptions.map((item) => (
            <OptionCard
              key={item.id}
              label={item.label}
              selected={value.paymentMethod === item.id}
              onClick={() =>
                onChange({
                  ...value,
                  paymentMethod: item.id,
                })
              }
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700" htmlFor="quiz-city">
          Город
        </label>
        <select
          id="quiz-city"
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
          value={value.city}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
        >
          {cityOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {isCredit ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Платёж в месяц</p>
            <div className="flex flex-wrap gap-2">
              {monthlyPresets.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`${chipBase} ${chipActive(value.monthlyBudget === n)}`}
                  onClick={() => onChange({ ...value, monthlyBudget: n })}
                >
                  {n.toLocaleString("ru-RU")} ₽
                </button>
              ))}
            </div>
            <Input
              label="Точный платёж, ₽"
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
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Максимальный бюджет авто</p>
            <div className="flex flex-wrap gap-2">
              {maxPricePresetsCredit.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`${chipBase} ${chipActive(value.maxPriceRub === n)}`}
                  onClick={() => onChange({ ...value, maxPriceRub: n })}
                >
                  {formatPricePresetRub(n)}
                </button>
              ))}
            </div>
            <Input
              label="Точный лимит по цене, ₽"
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
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Бюджет на авто (до)</p>
          <div className="flex flex-wrap gap-2">
            {maxPricePresetsCash.map((n) => (
              <button
                key={n}
                type="button"
                className={`${chipBase} ${chipActive(value.maxPriceRub === n)}`}
                onClick={() => onChange({ ...value, maxPriceRub: n })}
              >
                {formatPricePresetRub(n)}
              </button>
            ))}
          </div>
          <Input
            label="Точный лимит по цене, ₽"
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
        </div>
      )}

      <details className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-slate-800">
          Уточнить кузов и коробку (необязательно)
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            <span className="font-medium">Кузов</span>
            <select
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
              value={value.bodyType}
              onChange={(e) =>
                onChange({
                  ...value,
                  bodyType: e.target.value as SelectorState["bodyType"],
                })
              }
            >
              <option value="any">Любой</option>
              <option value="sedan">Седан</option>
              <option value="liftback">Лифтбек</option>
              <option value="hatchback">Хэтчбек</option>
              <option value="suv">Кроссовер/SUV</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            <span className="font-medium">Коробка</span>
            <select
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
              value={value.transmission}
              onChange={(e) =>
                onChange({
                  ...value,
                  transmission: e.target.value as SelectorState["transmission"],
                })
              }
            >
              <option value="any">Любая</option>
              <option value="automatic">Автомат</option>
              <option value="manual">Механика</option>
            </select>
          </label>
        </div>
      </details>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Button className="w-full sm:w-auto" disabled={!canSubmit} onClick={onComplete}>
          Показать подходящие варианты
        </Button>
        <div className="flex flex-col gap-2 sm:items-end">
          {skipCatalogHref ? (
            <Link
              href={skipCatalogHref}
              className="text-center text-sm font-semibold text-[color:var(--color-brand-accent)] hover:underline sm:text-right"
              onClick={onSkipCatalog}
            >
              В каталог без подбора
            </Link>
          ) : null}
          <p className="text-center text-xs text-slate-500 sm:text-right">
            Расширенные фильтры (год, пробег, привод) — в каталоге или ниже в результатах.
          </p>
        </div>
      </div>
    </Card>
  );
}
