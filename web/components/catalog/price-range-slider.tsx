"use client";

type PriceRangeSliderProps = {
  minBound: number;
  maxBound: number;
  valueMin: number;
  valueMax: number;
  onChange: (next: { min: number; max: number }) => void;
  formatValue: (n: number) => string;
};

export function PriceRangeSlider({
  minBound,
  maxBound,
  valueMin,
  valueMax,
  onChange,
  formatValue,
}: PriceRangeSliderProps) {
  const step = 50000;
  const disabled = !Number.isFinite(minBound) || !Number.isFinite(maxBound) || minBound >= maxBound;

  const clamp = (v: number) => Math.min(maxBound, Math.max(minBound, v));

  const low = clamp(Math.min(valueMin, valueMax));
  const high = clamp(Math.max(valueMin, valueMax));

  const setLow = (raw: number) => {
    const v = clamp(raw);
    if (v <= high) {
      onChange({ min: v, max: high });
    } else {
      onChange({ min: high, max: v });
    }
  };

  const setHigh = (raw: number) => {
    const v = clamp(raw);
    if (v >= low) {
      onChange({ min: low, max: v });
    } else {
      onChange({ min: v, max: low });
    }
  };

  const span = Math.max(1, maxBound - minBound);
  const lowPct = ((low - minBound) / span) * 100;
  const highPct = ((high - minBound) / span) * 100;

  const thumbClass =
    "absolute top-1/2 z-[2] h-8 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent";

  if (disabled) {
    return (
      <p className="text-sm text-slate-500">Нет данных для диапазона цен в выбранном городе.</p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs font-medium text-slate-600">
        <span>{formatValue(low)}</span>
        <span>{formatValue(high)}</span>
      </div>
      <div className="catalog-dual-range relative h-10">
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[color:var(--color-brand-accent)]/85"
          style={{
            left: `${lowPct}%`,
            width: `${Math.max(0, highPct - lowPct)}%`,
          }}
        />
        <input
          type="range"
          min={minBound}
          max={maxBound}
          step={step}
          value={low}
          disabled={disabled}
          aria-label="Минимальная цена"
          className={`${thumbClass} z-30`}
          onChange={(e) => setLow(Number(e.target.value))}
        />
        <input
          type="range"
          min={minBound}
          max={maxBound}
          step={step}
          value={high}
          disabled={disabled}
          aria-label="Максимальная цена"
          className={`${thumbClass} z-20`}
          onChange={(e) => setHigh(Number(e.target.value))}
        />
      </div>
      <p className="text-xs text-slate-500">
        Вилка по текущей выдаче: {formatValue(minBound)} — {formatValue(maxBound)}
      </p>
    </div>
  );
}
