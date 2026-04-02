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

const purchaseGoalLabel: Record<SelectorState["purchaseGoal"], string> = {
  family: "Для семьи",
  "first-car": "Первый авто",
  city: "На каждый день",
  comfort: "Комфорт и класс выше",
};

type SelectionSummaryProps = {
  selector: SelectorState;
};

export function SelectionSummary({ selector }: SelectionSummaryProps) {
  return (
    <Card className="space-y-4 p-5 md:p-6">
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-slate-950">Ваш выбор</h3>
        <p className="mt-1 text-sm text-slate-600">
          Подбираем авто именно по этим параметрам.
        </p>
      </div>
      <div className="grid gap-2 text-sm md:grid-cols-2">
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
          Платеж в месяц: <span className="font-semibold">{formatCurrency(selector.monthlyBudget)}</span>
        </p>
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
          Максимальный бюджет: <span className="font-semibold">{formatCurrency(selector.maxPriceRub)}</span>
        </p>
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
          Тип кузова: <span className="font-semibold">{bodyTypeLabel[selector.bodyType]}</span>
        </p>
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
          Город: <span className="font-semibold">{selector.city}</span>
        </p>
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700 md:col-span-2">
          Цель покупки:{" "}
          <span className="font-semibold">{purchaseGoalLabel[selector.purchaseGoal]}</span>
        </p>
      </div>
    </Card>
  );
}
