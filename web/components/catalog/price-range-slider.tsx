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
  const disabled = !Number.isFinite(minBound) || !Number.isFinite(maxBound) || minBound >= maxBound;
  const span = Math.max(1, maxBound - minBound);
  const step = span >= 1_000_000 ? 50_000 : span >= 200_000 ? 10_000 : 1_000;

  const clamp = (v: number) => Math.min(maxBound, Math.max(minBound, v));
  const alignToStep = (v: number) => {
    const clamped = clamp(v);
    const offset = Math.round((clamped - minBound) / step) * step;
    return clamp(minBound + offset);
  };

  const low = alignToStep(Math.min(valueMin, valueMax));
  const high = alignToStep(Math.max(valueMin, valueMax));

  const setLow = (raw: number) => {
    const v = alignToStep(raw);
    if (v <= high) {
      onChange({ min: v, max: high });
    } else {
      onChange({ min: high, max: v });
    }
  };

  const setHigh = (raw: number) => {
    const v = alignToStep(raw);
    if (v >= low) {
      onChange({ min: low, max: v });
    } else {
      onChange({ min: v, max: low });
    }
  };

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
          style={{ accentColor: "transparent" }}
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
          style={{ accentColor: "transparent" }}
          onChange={(e) => setHigh(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
