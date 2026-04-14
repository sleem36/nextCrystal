"use client";

import Link from "next/link";
import { buildCompareHref } from "@/lib/compare-selection";
import type { Car } from "@/types/car";

type ComparePanelProps = {
  compareIds: string[];
  carsById: Map<string, Car>;
  onRemove: (id: string) => void;
  onClear: () => void;
};

export function ComparePanel({ compareIds, carsById, onRemove, onClear }: ComparePanelProps) {
  if (compareIds.length < 2) {
    return null;
  }

  const href = buildCompareHref(compareIds);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_28px_rgba(0,0,0,0.12)] backdrop-blur-md"
      role="region"
      aria-label="Сравнение автомобилей"
    >
      <div className="container-wide mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[color:var(--color-brand-primary)]">
            К сравнению: {compareIds.length}
          </span>
          {compareIds.map((id) => {
            const car = carsById.get(id);
            const label = car ? `${car.brand} ${car.model}` : id;
            return (
              <span
                key={id}
                className="inline-flex max-w-[200px] items-center gap-1 rounded-full border border-slate-200 bg-slate-50 py-1 pl-2.5 pr-1 text-xs text-slate-800"
              >
                <span className="truncate">{label}</span>
                <button
                  type="button"
                  className="shrink-0 rounded-full p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                  aria-label={`Убрать ${label} из сравнения`}
                  onClick={() => onRemove(id)}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-[var(--radius-button)] border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            onClick={onClear}
          >
            Очистить
          </button>
          <Link
            href={href}
            className="inline-flex h-10 items-center justify-center rounded-[var(--radius-button)] bg-[color:var(--color-brand-accent)] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(220,38,38,0.35)] hover:bg-[color:var(--color-brand-accent-hover)]"
          >
            Сравнить
          </Link>
        </div>
      </div>
    </div>
  );
}
