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
    title: "Надежный на каждый день",
    subtitle: "Подержанные модели для ежедневных задач и понятного платежа",
    offer: "Подбор проверенных авто для ежедневной эксплуатации",
    monthlyBudget: 30000,
    purchaseGoal: "city",
  },
  {
    id: "family",
    title: "Для семьи (простор и безопасность)",
    subtitle: "Подержанные автомобили с акцентом на комфорт и безопасность",
    offer: "Семейные модели с прозрачной историей и понятными условиями",
    monthlyBudget: 50000,
    purchaseGoal: "family",
  },
  {
    id: "first-car",
    title: "Экономичный в обслуживании",
    subtitle: "Практичные подержанные авто с умеренными расходами",
    offer: "Экономичные варианты с прозрачной историей обслуживания",
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
    <section className="rounded-[var(--radius-card)] border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-5">
      <h2 className="text-base font-semibold tracking-tight text-[color:var(--color-brand-primary)] md:text-lg">
        Рекламные сценарии
      </h2>
      <p className="mt-0.5 text-xs text-slate-600 md:text-sm">
        Выберите сценарий — блок подбора откроется ниже без перехода по странице.
      </p>
      <div className="mt-3 grid gap-2 md:grid-cols-3 md:gap-3">
        {adScenarios.map((scenario) => {
          const isActive = scenario.id === activeScenario;

          return (
            <button
              key={scenario.id}
              type="button"
              className={`rounded-[var(--radius-button)] border p-4 text-left transition-colors duration-150 ${
                isActive
                  ? "border-[color:var(--color-brand-accent)] bg-[color:var(--color-brand-accent)] text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
              }`}
              onClick={() => onSelect(scenario)}
            >
              <p className="text-sm font-semibold">{scenario.title}</p>
              <p className={`mt-1 text-xs ${isActive ? "text-red-50/90" : "text-slate-600"}`}>
                {scenario.subtitle}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
