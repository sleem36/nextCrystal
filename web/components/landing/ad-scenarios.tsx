"use client";

export type ScenarioId = "budget" | "family" | "first-car";

export type AdScenario = {
  id: ScenarioId;
  title: string;
  subtitle: string;
  offer: string;
  monthlyBudget: number;
  purchaseGoal: "family" | "first-car" | "city";
};

export const adScenarios: AdScenario[] = [
  {
    id: "budget",
    title: "Платеж до 30 000 ₽/мес",
    subtitle: "Проверенные городские модели без переплаты",
    offer: "Подбор до 3 авто с платежом до 30 000 ₽/мес",
    monthlyBudget: 30000,
    purchaseGoal: "city",
  },
  {
    id: "family",
    title: "Семейный автомобиль",
    subtitle: "Комфорт, безопасность и место для всей семьи",
    offer: "Семейные модели с прозрачной историей и выгодным платежом",
    monthlyBudget: 50000,
    purchaseGoal: "family",
  },
  {
    id: "first-car",
    title: "Первый автомобиль",
    subtitle: "Спокойный вход и понятные ежемесячные условия",
    offer: "Первый авто без сложных условий: платеж от 35 000 ₽/мес",
    monthlyBudget: 35000,
    purchaseGoal: "first-car",
  },
];

type AdScenariosProps = {
  activeScenario: ScenarioId;
  onSelect: (scenario: AdScenario) => void;
};

export function AdScenarios({ activeScenario, onSelect }: AdScenariosProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-semibold tracking-tight text-slate-950">
        Рекламные сценарии
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Выберите готовый сценарий и получите подборку без лишних шагов.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {adScenarios.map((scenario) => {
          const isActive = scenario.id === activeScenario;

          return (
            <button
              key={scenario.id}
              type="button"
              className={`rounded-xl border p-4 text-left transition ${
                isActive
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
              }`}
              onClick={() => onSelect(scenario)}
            >
              <p className="text-sm font-semibold">{scenario.title}</p>
              <p className={`mt-1 text-xs ${isActive ? "text-slate-200" : "text-slate-600"}`}>
                {scenario.subtitle}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
