import { CarCard } from "@/components/landing/car-card";
import { Car } from "@/types/car";

type CarResultsProps = {
  cars: Car[];
  isExpanded: boolean;
  onSelect: (car: Car) => void;
  onExpandFilters: () => void;
  onRequestManualSelection: () => void;
};

export function CarResults({
  cars,
  isExpanded,
  onSelect,
  onExpandFilters,
  onRequestManualSelection,
}: CarResultsProps) {
  if (!cars.length) {
    return (
      <section className="space-y-4 rounded-[var(--radius-card)] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <p>
          Сейчас подходящие варианты не отображаются. Вы можете расширить параметры
          подбора или оставить заявку, и менеджер предложит авто вручную.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onExpandFilters}
            className="inline-flex h-10 items-center justify-center rounded-[var(--radius-button)] border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition-colors duration-150 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            Расширить фильтры
          </button>
          <button
            type="button"
            onClick={onRequestManualSelection}
            className="inline-flex h-10 items-center justify-center rounded-[var(--radius-button)] border border-[color:var(--color-brand-accent)] bg-[color:var(--color-brand-accent)] px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[color:var(--color-brand-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
          >
            Оставить заявку на подбор
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {isExpanded ? (
        <div className="rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Мы расширили параметры, чтобы показать доступные варианты.
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
