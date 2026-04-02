import { CarCard } from "@/components/landing/car-card";
import { Car } from "@/types/car";

type CarResultsProps = {
  cars: Car[];
  onSelect: (car: Car) => void;
};

export function CarResults({ cars, onSelect }: CarResultsProps) {
  if (!cars.length) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        По текущим параметрам точного совпадения нет. Оставьте заявку, и менеджер
        подберет авто вручную.
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {cars.map((car) => (
        <CarCard key={car.id} car={car} onSelect={onSelect} />
      ))}
    </section>
  );
}
