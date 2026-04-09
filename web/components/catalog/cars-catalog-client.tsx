"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QuizCatalogBanner } from "@/components/catalog/quiz-catalog-banner";
import { CarCard } from "@/components/landing/car-card";
import { useCompareSelection } from "@/hooks/use-compare-selection";
import { buildCompareHref } from "@/lib/compare-selection";
import { LeadForm } from "@/components/landing/lead-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OptionCard } from "@/components/ui/option-card";
import { METRIKA_GOALS, trackGoal } from "@/lib/analytics";
import {
  carListingFiltersToSearchParams,
  DEFAULT_CAR_LISTING_FILTERS,
  filterCars,
  getRelaxedSuggestions,
  parseCarListingSearchParams,
  type CarListingFilters,
} from "@/lib/car-filters";
import { utmFromSearchParams } from "@/lib/utm";
import type { CarBodyType } from "@/types/car";
import type { Car } from "@/types/car";

/** Согласовано с квизом на главной */
const CITY_OPTIONS = [
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

const BODY_OPTIONS: Array<{ id: CarBodyType | "any"; label: string }> = [
  { id: "any", label: "Любой" },
  { id: "sedan", label: "Седан" },
  { id: "liftback", label: "Лифтбек" },
  { id: "hatchback", label: "Хэтчбек" },
  { id: "suv", label: "Кроссовер/SUV" },
];

function CatalogLeadBlock({
  filters,
  utm,
}: {
  filters: CarListingFilters;
  utm: Record<string, string>;
}) {
  const context = useMemo(
    () => ({
      city: filters.city,
      carId: undefined as string | undefined,
      paymentMethod: filters.paymentMethod,
      monthlyBudget: filters.paymentMethod === "credit" ? filters.monthlyBudget : undefined,
      maxPriceRub: filters.maxPriceRub,
      bodyType: filters.bodyType,
      transmission: filters.transmission,
      drive: filters.drive,
      fuel: filters.fuel,
      yearFrom: filters.yearFrom,
      maxMileageKm: filters.maxMileageKm,
      purchaseGoal: undefined,
      utm,
    }),
    [filters, utm],
  );

  return (
    <div id="catalog-lead" className="scroll-mt-28">
      <LeadForm context={context} variant="card" />
    </div>
  );
}

function FiltersPanel({
  filters,
  onApply,
  onReset,
}: {
  filters: CarListingFilters;
  onApply: (f: CarListingFilters) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  const selectClass =
    "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2";

  return (
    <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-5">
      <h2 className="text-lg font-semibold text-[color:var(--color-brand-primary)]">Фильтры</h2>
      <p className="mt-1 text-sm text-slate-600">
        Параметры как в быстром подборе на главной. Нажмите «Применить», чтобы обновить URL и выдачу.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2 text-sm text-slate-700 md:col-span-2 lg:col-span-3">
          <span className="font-medium">Способ оплаты</span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:max-w-md">
            <OptionCard
              label="Кредит"
              selected={draft.paymentMethod === "credit"}
              onClick={() => setDraft((d) => ({ ...d, paymentMethod: "credit" }))}
            />
            <OptionCard
              label="Наличные"
              selected={draft.paymentMethod === "cash"}
              onClick={() => setDraft((d) => ({ ...d, paymentMethod: "cash" }))}
            />
          </div>
        </div>
        {draft.paymentMethod === "credit" ? (
          <Input
            label="Платёж в месяц, ₽"
            type="number"
            min={15000}
            step={1000}
            value={draft.monthlyBudget}
            onChange={(e) => setDraft((d) => ({ ...d, monthlyBudget: Number(e.target.value) }))}
          />
        ) : null}
        <Input
          label="Макс. цена авто, ₽"
          type="number"
          min={700000}
          step={50000}
          value={draft.maxPriceRub}
          onChange={(e) => setDraft((d) => ({ ...d, maxPriceRub: Number(e.target.value) }))}
        />
        <div className="flex flex-col gap-2 text-sm text-slate-700">
          <span className="font-medium">Город</span>
          <select
            className={selectClass}
            value={draft.city}
            onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
            aria-label="Город"
          >
            {CITY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 text-sm text-slate-700">
          <span className="font-medium">Кузов</span>
          <select
            className={selectClass}
            value={draft.bodyType}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                bodyType: e.target.value as CarBodyType | "any",
              }))
            }
            aria-label="Кузов"
          >
            {BODY_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 text-sm text-slate-700">
          <span className="font-medium">КПП</span>
          <select
            className={selectClass}
            value={draft.transmission}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                transmission: e.target.value as CarListingFilters["transmission"],
              }))
            }
            aria-label="Коробка передач"
          >
            <option value="any">Любая</option>
            <option value="automatic">Автомат</option>
            <option value="manual">Механика</option>
          </select>
        </div>
        <div className="flex flex-col gap-2 text-sm text-slate-700">
          <span className="font-medium">Привод</span>
          <select
            className={selectClass}
            value={draft.drive}
            onChange={(e) =>
              setDraft((d) => ({ ...d, drive: e.target.value as CarListingFilters["drive"] }))
            }
            aria-label="Привод"
          >
            <option value="any">Любой</option>
            <option value="fwd">Передний</option>
            <option value="rwd">Задний</option>
            <option value="awd">Полный</option>
          </select>
        </div>
        <div className="flex flex-col gap-2 text-sm text-slate-700">
          <span className="font-medium">Топливо</span>
          <select
            className={selectClass}
            value={draft.fuel}
            onChange={(e) =>
              setDraft((d) => ({ ...d, fuel: e.target.value as CarListingFilters["fuel"] }))
            }
            aria-label="Топливо"
          >
            <option value="any">Любое</option>
            <option value="petrol">Бензин</option>
            <option value="diesel">Дизель</option>
            <option value="hybrid">Гибрид</option>
          </select>
        </div>
        <Input
          label="Год от"
          type="number"
          min={2005}
          max={new Date().getFullYear()}
          step={1}
          value={draft.yearFrom}
          onChange={(e) => setDraft((d) => ({ ...d, yearFrom: Number(e.target.value) }))}
        />
        <Input
          label="Пробег до, км"
          type="number"
          min={30000}
          step={5000}
          value={draft.maxMileageKm}
          onChange={(e) => setDraft((d) => ({ ...d, maxMileageKm: Number(e.target.value) }))}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={() => onApply(draft)}>
          Применить
        </Button>
        <Button type="button" variant="secondary" onClick={onReset}>
          Сбросить
        </Button>
        <a
          href="#catalog-lead"
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] px-5 text-sm font-semibold text-[color:var(--color-brand-accent)] underline-offset-4 hover:underline"
        >
          Заявка без подбора
        </a>
      </div>
    </div>
  );
}

export function CarsCatalogClient({ cars }: { cars: Car[] }) {
  const { compareIds, toggle } = useCompareSelection();
  const sp = useSearchParams();
  const router = useRouter();
  const metrikaId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || 0) || undefined;

  const utm = useMemo(
    () => utmFromSearchParams(Object.fromEntries(sp.entries())),
    [sp],
  );

  const filters = useMemo(
    () => parseCarListingSearchParams(Object.fromEntries(sp.entries())),
    [sp],
  );

  const filtered = useMemo(() => filterCars(cars, filters), [cars, filters]);
  const relaxed = useMemo(
    () => (filtered.length === 0 ? getRelaxedSuggestions(cars, filters) : []),
    [cars, filters, filtered.length],
  );

  const apply = (f: CarListingFilters) => {
    const params = carListingFiltersToSearchParams(f);
    for (const [key, value] of Object.entries(utm)) {
      params.set(key, value);
    }
    trackGoal(metrikaId, METRIKA_GOALS.catalogFiltersApplied, {
      action: "apply",
      paymentMethod: f.paymentMethod,
      city: f.city,
      ...(f.paymentMethod === "credit" ? { monthlyBudget: f.monthlyBudget } : {}),
      maxPriceRub: f.maxPriceRub,
      bodyType: f.bodyType,
      transmission: f.transmission,
    });
    router.push(`/cars?${params.toString()}`);
  };

  const reset = () => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(utm)) {
      params.set(key, value);
    }
    trackGoal(metrikaId, METRIKA_GOALS.catalogFiltersApplied, {
      action: "reset",
    });
    const query = params.toString();
    router.push(query ? `/cars?${query}` : "/cars");
  };

  const showList = filtered.length > 0 ? filtered : relaxed;
  const isRelaxed = filtered.length === 0 && relaxed.length > 0;

  useEffect(() => {
    trackGoal(metrikaId, METRIKA_GOALS.catalogOpened, {
      paymentMethod: filters.paymentMethod,
      city: filters.city,
      ...(filters.paymentMethod === "credit" ? { monthlyBudget: filters.monthlyBudget } : {}),
      maxPriceRub: filters.maxPriceRub,
      bodyType: filters.bodyType,
      transmission: filters.transmission,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- только при первом открытии каталога
  }, []);

  useEffect(() => {
    if (showList.length > 0) return;
    trackGoal(metrikaId, METRIKA_GOALS.noResultsShown, {
      paymentMethod: filters.paymentMethod,
      city: filters.city,
      ...(filters.paymentMethod === "credit" ? { monthlyBudget: filters.monthlyBudget } : {}),
      maxPriceRub: filters.maxPriceRub,
      bodyType: filters.bodyType,
      transmission: filters.transmission,
    });
  }, [filters, metrikaId, showList.length]);

  return (
    <div className="space-y-8">
      {compareIds.length >= 2 ? (
        <Link
          href={buildCompareHref(compareIds)}
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[color:var(--color-brand-primary)] shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition hover:border-[color:var(--color-brand-accent)] hover:text-[color:var(--color-brand-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
        >
          Сравнить ({compareIds.length})
        </Link>
      ) : null}

      <QuizCatalogBanner />

      <FiltersPanel filters={filters} onApply={apply} onReset={reset} />

      {showList.length > 0 ? (
        <section className="space-y-4" aria-label="Список автомобилей">
          {isRelaxed ? (
            <div className="rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              По текущим фильтрам ничего не нашлось — показаны{" "}
              <strong>ближайшие по параметрам</strong> (смягчены{" "}
              {filters.paymentMethod === "credit" ? "платёж, " : ""}цена, год и пробег). Попробуйте
              изменить город или КПП — или оставьте заявку ниже.
            </div>
          ) : null}
          {!isRelaxed ? (
            <p className="text-sm text-slate-600">
              Найдено: <strong>{filtered.length}</strong>{" "}
              {filtered.length === 1 ? "автомобиль" : filtered.length < 5 ? "автомобиля" : "автомобилей"}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {showList.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                catalog
                compare={{
                  checked: compareIds.includes(car.id),
                  disabled: !compareIds.includes(car.id) && compareIds.length >= 3,
                  onToggle: () => {
                    const willAdd = !compareIds.includes(car.id);
                    toggle(car.id);
                    trackGoal(
                      metrikaId,
                      willAdd ? METRIKA_GOALS.compareAdd : METRIKA_GOALS.compareRemove,
                      {
                        carId: car.id,
                        paymentMethod: filters.paymentMethod,
                        city: filters.city,
                        ...(filters.paymentMethod === "credit"
                          ? { monthlyBudget: filters.monthlyBudget }
                          : {}),
                        maxPriceRub: filters.maxPriceRub,
                        bodyType: filters.bodyType,
                        transmission: filters.transmission,
                      },
                    );
                  },
                }}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-4 rounded-[var(--radius-card)] border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-lg font-semibold text-[color:var(--color-brand-primary)]">
            Нет подходящих вариантов
          </h2>
          <p>
            Попробуйте расширить фильтры или оставьте заявку — подберём авто вручную и перезвоним с
            вариантами.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={reset}>
              Сбросить фильтры
            </Button>
            <Button type="button" variant="secondary" onClick={() => apply(DEFAULT_CAR_LISTING_FILTERS)}>
              Вернуть значения по умолчанию
            </Button>
          </div>
        </section>
      )}

      <CatalogLeadBlock filters={filters} utm={utm} />
    </div>
  );
}
