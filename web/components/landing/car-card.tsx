import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatMileage } from "@/lib/format";
import { Car } from "@/types/car";

type CarCardProps = {
  car: Car;
  onSelect: (car: Car) => void;
};

export function CarCard({ car, onSelect }: CarCardProps) {
  return (
    <Card className="space-y-4 p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-slate-950">
          {car.brand} {car.model}, {car.year}
        </h3>
        <Badge tone="success">Решение за 5 секунд</Badge>
      </div>
      <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-3">
        <p>
          <span className="block text-xs text-slate-500">Цена</span>
          <span className="font-semibold text-slate-900">{formatCurrency(car.priceRub)}</span>
        </p>
        <p>
          <span className="block text-xs text-slate-500">Платеж/мес</span>
          <span className="font-semibold text-slate-900">
            {formatCurrency(car.monthlyPaymentRub)}
          </span>
        </p>
        <p>
          <span className="block text-xs text-slate-500">Пробег</span>
          <span className="font-semibold text-slate-900">
            {formatMileage(car.mileageKm)} км
          </span>
        </p>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          Доверие
        </p>
        <ul className="space-y-1 text-sm text-slate-600">
          {car.trustPoints.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </div>
      <Button className="w-full sm:w-auto" onClick={() => onSelect(car)}>
        Получить расчет по этому авто
      </Button>
    </Card>
  );
}
