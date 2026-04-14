import { Card } from "@/components/ui/card";
import { SelectorState } from "@/components/landing/quick-selector";
import { formatCurrency } from "@/lib/format";

const bodyTypeLabel: Record<SelectorState["bodyType"], string> = {
  any: "Любой",
  sedan: "Седан",
  liftback: "Лифтбек",
  hatchback: "Хэтчбек",
  suv: "Кроссовер/SUV",
};
const transmissionLabel: Record<SelectorState["transmission"], string> = {
  any: "Любая",
  automatic: "Автомат",
  manual: "Механика",
};
const driveLabel: Record<SelectorState["drive"], string> = {
  any: "Любой",
  fwd: "Передний",
  rwd: "Задний",
  awd: "Полный",
};
const fuelLabel: Record<SelectorState["fuel"], string> = {
  any: "Любое",
  petrol: "Бензин",
  diesel: "Дизель",
  hybrid: "Гибрид",
  electric: "Электро",
};

type SelectionSummaryProps = {
  selector: SelectorState;
};

export function SelectionSummary({ selector }: SelectionSummaryProps) {
  return (
    <Card className="space-y-3 border-l-4 border-[color:var(--color-brand-accent)] p-4 md:p-5">
      <div>
        <h3 className="text-base font-semibold tracking-tight text-[color:var(--color-brand-primary)] md:text-lg">
          Ваш выбор
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Подбираем авто именно по этим параметрам.
        </p>
      </div>
      <div className="grid gap-2 text-sm md:grid-cols-2">
        {selector.paymentMethod === "credit" ? (
          <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
            Платеж в месяц: <span className="font-semibold">{formatCurrency(selector.monthlyBudget)}</span>
          </p>
        ) : (
          <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
            Способ оплаты: <span className="font-semibold">Наличные</span>
          </p>
        )}
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
          Максимальный бюджет: <span className="font-semibold">{formatCurrency(selector.maxPriceRub)}</span>
        </p>
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
          Тип кузова: <span className="font-semibold">{bodyTypeLabel[selector.bodyType]}</span>
        </p>
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
          Коробка: <span className="font-semibold">{transmissionLabel[selector.transmission]}</span>
        </p>
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
          Город: <span className="font-semibold">{selector.city}</span>
        </p>
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700 md:col-span-2">
          Расширенные параметры:{" "}
          <span className="font-semibold">
            привод {driveLabel[selector.drive]}, год от {selector.yearFrom}, пробег до{" "}
            {selector.maxMileageKm.toLocaleString("ru-RU")} км, топливо {fuelLabel[selector.fuel]}
          </span>
        </p>
      </div>
    </Card>
  );
}
