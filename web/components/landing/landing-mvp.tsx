"use client";

import { useEffect, useMemo, useState } from "react";
import { adScenarios, AdScenarios, ScenarioId } from "@/components/landing/ad-scenarios";
import { CarResults } from "@/components/landing/car-results";
import { Hero } from "@/components/landing/hero";
import { LeadForm } from "@/components/landing/lead-form";
import { QuickSelector, SelectorState } from "@/components/landing/quick-selector";
import { SelectionSummary } from "@/components/landing/selection-summary";
import { TrustBar } from "@/components/landing/trust-bar";
import { METRIKA_GOALS, trackGoal } from "@/lib/analytics";
import { Car } from "@/types/car";

const metrikaId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || 0) || undefined;

export function LandingMvp() {
  const [selectedCar, setSelectedCar] = useState<Car | undefined>();
  const [activeScenario, setActiveScenario] = useState<ScenarioId>("family");
  const [cars, setCars] = useState<Car[]>([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [carsError, setCarsError] = useState("");
  const [selector, setSelector] = useState<SelectorState>({
    monthlyBudget: 35000,
    maxPriceRub: 2500000,
    bodyType: "any",
    city: "Барнаул",
    purchaseGoal: "family",
  });

  useEffect(() => {
    let active = true;

    const loadCars = async () => {
      try {
        setCarsLoading(true);
        setCarsError("");
        const response = await fetch("/api/cars", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Cars request failed");
        }
        const payload = (await response.json()) as { cars: Car[] };
        if (active) {
          setCars(payload.cars);
        }
      } catch {
        if (active) {
          setCarsError("Не удалось загрузить автомобили. Попробуйте обновить страницу.");
        }
      } finally {
        if (active) {
          setCarsLoading(false);
        }
      }
    };

    loadCars();
    return () => {
      active = false;
    };
  }, []);

  const utm = useMemo(() => {
    const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : "",
    );
    return keys.reduce<Record<string, string>>((acc, key) => {
      const value = params.get(key);
      if (value) {
        acc[key] = value;
      }
      return acc;
    }, {});
  }, []);

  const filteredCars = useMemo(
    () =>
      cars.filter(
        (car) =>
          car.monthlyPaymentRub <= selector.monthlyBudget &&
          car.priceRub <= selector.maxPriceRub &&
          car.tags.includes(selector.purchaseGoal) &&
          car.cities.includes(selector.city) &&
          (selector.bodyType === "any" || car.bodyType === selector.bodyType),
      ),
    [cars, selector],
  );

  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const scenario = adScenarios.find((item) => item.id === activeScenario) ?? adScenarios[0];

  return (
    <div className="space-y-5 md:space-y-6">
      <Hero
        offer={scenario.offer}
        onPrimaryClick={() => {
          trackGoal(metrikaId, METRIKA_GOALS.heroCtaClick, { scenario: activeScenario });
          scrollToId("quick-selector");
        }}
      />
      <AdScenarios
        activeScenario={activeScenario}
        onSelect={(scenario) => {
          setActiveScenario(scenario.id);
          setSelector({
            monthlyBudget: scenario.monthlyBudget,
            maxPriceRub: 2500000,
            bodyType: "any",
            city: "Барнаул",
            purchaseGoal: scenario.purchaseGoal,
          });
          trackGoal(metrikaId, METRIKA_GOALS.scenarioSelected, { scenario: scenario.id });
          scrollToId("quick-selector");
        }}
      />
      <QuickSelector
        value={selector}
        onChange={setSelector}
        onComplete={() => {
          trackGoal(metrikaId, METRIKA_GOALS.quizCompleted, {
            monthlyBudget: selector.monthlyBudget,
            maxPriceRub: selector.maxPriceRub,
            city: selector.city,
            bodyType: selector.bodyType,
            purchaseGoal: selector.purchaseGoal,
            scenario: activeScenario,
          });
          scrollToId("results");
        }}
      />
      <TrustBar />
      <section id="results" className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Подходящие варианты
        </h2>
        <SelectionSummary selector={selector} />
        {carsLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Загружаем актуальные автомобили...
          </div>
        ) : null}
        {carsError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {carsError}
          </div>
        ) : null}
        <CarResults
          cars={carsLoading || carsError ? [] : filteredCars}
          onSelect={(car) => {
            setSelectedCar(car);
            scrollToId("lead-form");
          }}
        />
      </section>
      <LeadForm
        context={{
          city: selector.city,
          selectedCarId: selectedCar?.id,
          monthlyBudget: selector.monthlyBudget,
          maxPriceRub: selector.maxPriceRub,
          bodyType: selector.bodyType,
          purchaseGoal: selector.purchaseGoal,
          scenario: activeScenario,
          utm,
        }}
      />
    </div>
  );
}
