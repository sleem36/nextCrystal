"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PriceRangeSlider } from "@/components/catalog/price-range-slider";
import { DEFAULT_CAR_LISTING_FILTERS } from "@/lib/car-filters";
import { formatCurrency } from "@/lib/format";
import type { CarBodyType } from "@/types/car";
import type { CarListingFilters, OwnerBucket } from "@/lib/car-filters";

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

type FilterSidebarProps = {
  filters: CarListingFilters;
  priceBounds: { min: number; max: number };
  colorOptions: string[];
  onApply: (f: CarListingFilters) => void;
  onReset: () => void;
};

export function FilterSidebar({
  filters,
  priceBounds,
  colorOptions,
  onApply,
  onReset,
}: FilterSidebarProps) {
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  const selectClass =
    "select-arrow-offset h-12 w-full rounded-xl border border-slate-300 bg-white pl-4 pr-14 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2";

  const bounds = priceBounds;
  const displayMin =
    draft.priceMinRub > 0 ? Math.max(bounds.min, draft.priceMinRub) : bounds.min;
  const displayMax = Math.max(bounds.min, Math.min(draft.maxPriceRub, bounds.max));

  const toggleOwner = (b: OwnerBucket) => {
    setDraft((d) => {
      const has = d.ownerBuckets.includes(b);
      const ownerBuckets = has ? d.ownerBuckets.filter((x) => x !== b) : [...d.ownerBuckets, b];
      return { ...d, ownerBuckets };
    });
  };

  const nextFilters = useMemo(() => {
    const next = { ...draft };
    if (bounds.min < bounds.max) {
      next.priceMinRub = displayMin <= bounds.min ? 0 : displayMin;
    }
    if (next.yearFrom > next.yearTo) {
      next.yearTo = next.yearFrom;
    }
    if (next.mileageFromKm > next.maxMileageKm) {
      next.maxMileageKm = next.mileageFromKm;
    }
    return next;
  }, [bounds.max, bounds.min, displayMin, draft]);

  const canApply = useMemo(
    () => JSON.stringify(nextFilters) !== JSON.stringify(filters),
    [filters, nextFilters],
  );
  const canReset = true;

  const handleApply = () => {
    onApply(nextFilters);
  };

  const handleReset = () => {
    setDraft(DEFAULT_CAR_LISTING_FILTERS);
    onReset();
  };

  return (
    <div className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)] md:p-5">
      <h2 className="text-lg font-semibold text-[color:var(--color-brand-primary)]">Фильтры</h2>

      <div className="mt-4 space-y-5">
        <div className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Цена, ₽</span>
          <PriceRangeSlider
            minBound={bounds.min}
            maxBound={bounds.max}
            valueMin={displayMin}
            valueMax={displayMax}
            formatValue={(n) => formatCurrency(n)}
            onChange={({ min, max }) => {
              setDraft((d) => ({
                ...d,
                priceMinRub: min <= bounds.min ? 0 : min,
                maxPriceRub: max,
              }));
            }}
          />
        </div>

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

        <div className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Год</span>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 transition placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
              type="number"
              min={2005}
              max={new Date().getFullYear()}
              step={1}
              value={draft.yearFrom}
              placeholder="от"
              onChange={(e) => setDraft((d) => ({ ...d, yearFrom: Number(e.target.value) }))}
            />
            <input
              className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 transition placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
              type="number"
              min={2005}
              max={new Date().getFullYear()}
              step={1}
              value={draft.yearTo}
              placeholder="до"
              onChange={(e) => setDraft((d) => ({ ...d, yearTo: Number(e.target.value) }))}
            />
          </div>
        </div>
        <div className="space-y-2 text-sm text-slate-700">
          <span className="font-medium">Пробег, км</span>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 transition placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
              type="number"
              min={0}
              step={5000}
              value={draft.mileageFromKm}
              placeholder="от"
              onChange={(e) => setDraft((d) => ({ ...d, mileageFromKm: Number(e.target.value) }))}
            />
            <input
              className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 transition placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
              type="number"
              min={30000}
              step={5000}
              value={draft.maxMileageKm}
              placeholder="до"
              onChange={(e) => setDraft((d) => ({ ...d, maxMileageKm: Number(e.target.value) }))}
            />
          </div>
        </div>

        <fieldset className="space-y-2 text-sm text-slate-700">
          <legend className="font-medium">Владельцы по ПТС</legend>
          <div className="flex flex-col gap-2">
            {(["1", "2", "3plus"] as const).map((b) => (
              <label key={b} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.ownerBuckets.includes(b)}
                  onChange={() => toggleOwner(b)}
                  className="h-4 w-4 rounded border-slate-300 text-[color:var(--color-brand-accent)]"
                />
                <span>{b === "3plus" ? "3 и более" : b}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2 text-sm text-slate-700">
          <legend className="font-medium">Состояние по ДТП</legend>
          <div className="flex flex-col gap-2">
            {(
              [
                ["none", "Без ДТП"],
                ["any", "Любые"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="accident"
                  checked={draft.accident === value}
                  onChange={() => setDraft((d) => ({ ...d, accident: value }))}
                  className="h-4 w-4 border-slate-300 text-[color:var(--color-brand-accent)]"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2 text-sm text-slate-700">
          <legend className="font-medium">ПТС</legend>
          <div className="flex flex-col gap-2">
            {(
              [
                ["original", "Оригинал"],
                ["duplicate", "Дубликат"],
                ["any", "Любой"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="ptsStatus"
                  checked={draft.pts === value}
                  onChange={() => setDraft((d) => ({ ...d, pts: value }))}
                  className="h-4 w-4 border-slate-300 text-[color:var(--color-brand-accent)]"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-2 text-sm text-slate-700">
          <span className="font-medium">Цвет</span>
          <select
            className={selectClass}
            value={draft.color}
            onChange={(e) => setDraft((d) => ({ ...d, color: e.target.value }))}
            aria-label="Цвет кузова"
          >
            <option value="">Любой</option>
            {colorOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={draft.hasVideoOnly}
            onChange={(e) => setDraft((d) => ({ ...d, hasVideoOnly: e.target.checked }))}
            className="h-4 w-4 rounded border-slate-300 text-[color:var(--color-brand-accent)]"
          />
          <span>Только с видеообзором</span>
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={draft.withoutPaintOnly}
            onChange={(e) => setDraft((d) => ({ ...d, withoutPaintOnly: e.target.checked }))}
            className="h-4 w-4 rounded border-slate-300 text-[color:var(--color-brand-accent)]"
          />
          <span>Без окраса</span>
        </label>
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 mt-5 border-t border-slate-200 bg-white px-4 pt-3 pb-1 md:-mx-5 md:px-5">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <Button type="button" variant="secondary" onClick={handleReset} disabled={!canReset}>
            Сбросить фильтры
          </Button>
          <Button type="button" onClick={handleApply} aria-disabled={!canApply}>
            Применить
          </Button>
        </div>
      </div>
    </div>
  );
}
