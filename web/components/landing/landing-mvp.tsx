"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdvantagesSection } from "@/components/home/advantages-section";
import { CarResults } from "@/components/landing/car-results";
import { HeroCompact } from "@/components/landing/hero-compact";
import { LeadForm } from "@/components/landing/lead-form";
import { QuickSelector, SelectorState } from "@/components/landing/quick-selector";
import { SelectionSummary } from "@/components/landing/selection-summary";
import { Modal } from "@/components/ui/modal";
import { METRIKA_GOALS, trackGoal } from "@/lib/analytics";
import { buildCarsUrlFromQuiz, saveQuizAnswers } from "@/lib/quiz-answers";
import { Car } from "@/types/car";

const metrikaId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || 0) || undefined;

type LandingMvpProps = {
  initialCars: Car[];
};

export function LandingMvp({ initialCars }: LandingMvpProps) {
  const [selectedCar, setSelectedCar] = useState<Car | undefined>();
  const [leadOpen, setLeadOpen] = useState(false);
  const [funnelOpen, setFunnelOpen] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const quickSelectorRef = useRef<HTMLDivElement | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);

  const [cars] = useState<Car[]>(initialCars);
  const [selector, setSelector] = useState<SelectorState>({
    paymentMethod: "credit",
    monthlyBudget: 35000,
    maxPriceRub: 2500000,
    bodyType: "any",
    transmission: "any",
    city: "Барнаул",
    drive: "any",
    fuel: "any",
    yearFrom: 2018,
    maxMileageKm: 90000,
  });

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

  const catalogFromQuizHref = useMemo(
    () => buildCarsUrlFromQuiz(selector, utm),
    [selector, utm],
  );

  const primaryFilteredCars = useMemo(
    () =>
      cars.filter((car) => {
        if (selector.paymentMethod === "credit" && car.monthlyPaymentRub > selector.monthlyBudget)
          return false;
        if (car.priceRub > selector.maxPriceRub) return false;
        if (car.city !== selector.city) return false;
        if (selector.bodyType !== "any" && car.bodyType !== selector.bodyType) return false;
        if (selector.transmission !== "any" && car.transmission !== selector.transmission)
          return false;
        return true;
      }),
    [cars, selector],
  );

  const filteredCars = useMemo(
    () =>
      primaryFilteredCars.filter((car) => {
        if (car.year < selector.yearFrom) return false;
        if (car.mileageKm > selector.maxMileageKm) return false;
        if (selector.drive !== "any" && car.drive !== selector.drive) return false;
        if (selector.fuel !== "any" && car.fuel !== selector.fuel) return false;
        return true;
      }),
    [primaryFilteredCars, selector],
  );

  const expandedCars = useMemo(() => {
    if (filteredCars.length) {
      return filteredCars;
    }

    const relaxedMonthlyBudget = Math.round(selector.monthlyBudget * 1.2);
    const relaxedMaxPrice = Math.round(selector.maxPriceRub * 1.15);
    const relaxedYearFrom = Math.max(2005, selector.yearFrom - 2);
    const relaxedMileage = selector.maxMileageKm + 30000;
    const similarCars = cars
      .filter((car) => {
        const monthlyMatch =
          selector.paymentMethod === "cash" || car.monthlyPaymentRub <= relaxedMonthlyBudget;
        const budgetMatch = monthlyMatch && car.priceRub <= relaxedMaxPrice;
        const cityMatch = car.city === selector.city;
        const bodyMatch = selector.bodyType === "any" || car.bodyType === selector.bodyType;
        const transmissionMatch =
          selector.transmission === "any" || car.transmission === selector.transmission;
        const driveMatch = selector.drive === "any" || car.drive === selector.drive;
        const fuelMatch = selector.fuel === "any" || car.fuel === selector.fuel;
        const yearMatch = car.year >= relaxedYearFrom;
        const mileageMatch = car.mileageKm <= relaxedMileage;
        return (
          budgetMatch &&
          yearMatch &&
          mileageMatch &&
          (cityMatch || bodyMatch) &&
          transmissionMatch &&
          driveMatch &&
          fuelMatch
        );
      })
      .sort((a, b) => {
        const scoreA =
          (selector.paymentMethod === "credit"
            ? Math.abs(a.monthlyPaymentRub - selector.monthlyBudget)
            : 0) +
          Math.abs(a.priceRub - selector.maxPriceRub) / 50;
        const scoreB =
          (selector.paymentMethod === "credit"
            ? Math.abs(b.monthlyPaymentRub - selector.monthlyBudget)
            : 0) +
          Math.abs(b.priceRub - selector.maxPriceRub) / 50;
        return scoreA - scoreB;
      });

    return similarCars.slice(0, 8);
  }, [cars, filteredCars, selector]);

  const isExpandedResults = !filteredCars.length && expandedCars.length > 0;

  const leadContext = useMemo(
    () => ({
      city: selector.city,
      carId: selectedCar?.id,
      paymentMethod: selector.paymentMethod,
      monthlyBudget: selector.paymentMethod === "credit" ? selector.monthlyBudget : undefined,
      maxPriceRub: selector.maxPriceRub,
      bodyType: selector.bodyType,
      transmission: selector.transmission,
      drive: selector.drive,
      fuel: selector.fuel,
      yearFrom: selector.yearFrom,
      maxMileageKm: selector.maxMileageKm,
      purchaseGoal: undefined,
      utm,
    }),
    [selectedCar?.id, selector, utm],
  );

  const openFunnel = () => {
    setFunnelOpen(true);
    setQuizComplete(false);
  };

  const expandFiltersAndRetry = () => {
    if (!cars.length) return;

    const maxMonthly = Math.max(...cars.map((item) => item.monthlyPaymentRub));
    const maxPrice = Math.max(...cars.map((item) => item.priceRub));
    const minYear = Math.min(...cars.map((item) => item.year));
    const maxMileage = Math.max(...cars.map((item) => item.mileageKm));

    setSelector((prev) => ({
      ...prev,
      monthlyBudget: Math.max(prev.monthlyBudget, maxMonthly),
      maxPriceRub: Math.max(prev.maxPriceRub, maxPrice),
      yearFrom: Math.min(prev.yearFrom, minYear),
      maxMileageKm: Math.max(prev.maxMileageKm, maxMileage),
      bodyType: "any",
      transmission: "any",
      drive: "any",
      fuel: "any",
    }));
  };

  const openManualLead = () => {
    setSelectedCar(undefined);
    setLeadOpen(true);
    trackGoal(metrikaId, METRIKA_GOALS.leadModalOpen, {
      source: "no_results",
      filterMode: "primary",
    });
  };

  const focusQuickSelector = () => {
    const target = quickSelectorRef.current;
    if (!target) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const header = document.querySelector("header");
    const headerOffset = header instanceof HTMLElement ? header.offsetHeight + 12 : 12;
    const y = window.scrollY + target.getBoundingClientRect().top - headerOffset;

    window.scrollTo({
      top: Math.max(0, y),
      behavior: reduceMotion ? "auto" : "smooth",
    });

    if (reduceMotion) return;

    target.classList.add("focus-target-highlight");
    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = window.setTimeout(() => {
      target.classList.remove("focus-target-highlight");
      highlightTimeoutRef.current = null;
    }, 1300);
  };

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6 md:space-y-7">
      <HeroCompact
        onPrimaryClick={() => {
          trackGoal(metrikaId, METRIKA_GOALS.heroCtaClick);
          openFunnel();
          window.setTimeout(focusQuickSelector, 80);
        }}
        onCatalogClick={() => {
          trackGoal(metrikaId, METRIKA_GOALS.heroCatalogClick, { source: "hero" });
        }}
      />
      <AdvantagesSection />

      <div
        className={`grid transition-[grid-template-rows] duration-[var(--motion-panel)] ease-[var(--easing-standard)] motion-reduce:transition-none ${
          funnelOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-6 border-t border-slate-200/80 pt-6 md:space-y-7" aria-hidden={!funnelOpen}>
            <div ref={quickSelectorRef} id="quick-selector" className="container-wide">
              <QuickSelector
                value={selector}
                onChange={setSelector}
                onComplete={() => {
                  setQuizComplete(true);
                  saveQuizAnswers(selector);
                  trackGoal(metrikaId, METRIKA_GOALS.quizCompleted, {
                    paymentMethod: selector.paymentMethod,
                    monthlyBudget: selector.monthlyBudget,
                    maxPriceRub: selector.maxPriceRub,
                    city: selector.city,
                    bodyType: selector.bodyType,
                    transmission: selector.transmission,
                    drive: selector.drive,
                    fuel: selector.fuel,
                    yearFrom: selector.yearFrom,
                    maxMileageKm: selector.maxMileageKm,
                  });
                }}
              />
            </div>

            {quizComplete ? (
              <div className="container-wide">
                <section
                  className="space-y-4 rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-opacity duration-[var(--motion-panel)] motion-reduce:transition-none md:p-5 lg:p-6"
                  id="results"
                >
                  <h2 className="text-lg font-semibold tracking-tight text-[color:var(--color-brand-primary)] md:text-xl">
                    Подходящие варианты
                  </h2>
                  <SelectionSummary selector={selector} />
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Link
                      href={catalogFromQuizHref}
                      onClick={() =>
                        trackGoal(metrikaId, METRIKA_GOALS.catalogFromQuizClick, {
                          city: selector.city,
                          paymentMethod: selector.paymentMethod,
                          monthlyBudget: selector.monthlyBudget,
                        })
                      }
                      className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button,0.5rem)] bg-[color:var(--color-brand-accent)] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,118,234,0.35)] transition-colors hover:bg-[color:var(--color-brand-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
                    >
                      Смотреть подборку в каталоге
                    </Link>
                    <span className="text-xs text-slate-500">
                      Те же фильтры, что в быстром подборе — откроется в каталоге с UTM из текущей
                      страницы.
                    </span>
                  </div>
                  <details className="rounded-[var(--radius-card)] border border-slate-200 bg-slate-50/70 p-4">
                    <summary className="cursor-pointer text-sm font-medium text-slate-800">
                      Расширенные параметры
                    </summary>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <label className="flex flex-col gap-1 text-sm text-slate-700">
                        <span className="font-medium">Год выпуска от</span>
                        <input
                          type="number"
                          min={2005}
                          max={new Date().getFullYear()}
                          step={1}
                          value={selector.yearFrom}
                          onChange={(event) =>
                            setSelector((prev) => ({ ...prev, yearFrom: Number(event.target.value) }))
                          }
                          className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm text-slate-700">
                        <span className="font-medium">Пробег до, км</span>
                        <input
                          type="number"
                          min={30000}
                          step={5000}
                          value={selector.maxMileageKm}
                          onChange={(event) =>
                            setSelector((prev) => ({
                              ...prev,
                              maxMileageKm: Number(event.target.value),
                            }))
                          }
                          className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
                        />
                      </label>
                      <div className="space-y-1 text-sm text-slate-700">
                        <p className="font-medium">Привод</p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: "any", label: "Любой" },
                            { id: "fwd", label: "Передний" },
                            { id: "rwd", label: "Задний" },
                            { id: "awd", label: "Полный" },
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                setSelector((prev) => ({
                                  ...prev,
                                  drive: item.id as SelectorState["drive"],
                                }))
                              }
                              className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                                selector.drive === item.id
                                  ? "border-[color:var(--color-brand-accent)] bg-[color:var(--color-brand-accent)] text-white"
                                  : "border-slate-300 bg-white text-slate-700"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-slate-700">
                        <p className="font-medium">Топливо</p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: "any", label: "Любое" },
                            { id: "petrol", label: "Бензин" },
                            { id: "diesel", label: "Дизель" },
                            { id: "hybrid", label: "Гибрид" },
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                setSelector((prev) => ({
                                  ...prev,
                                  fuel: item.id as SelectorState["fuel"],
                                }))
                              }
                              className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                                selector.fuel === item.id
                                  ? "border-[color:var(--color-brand-accent)] bg-[color:var(--color-brand-accent)] text-white"
                                  : "border-slate-300 bg-white text-slate-700"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </details>
                  <CarResults
                    cars={expandedCars}
                    isExpanded={isExpandedResults}
                    onSelect={(car) => {
                      setSelectedCar(car);
                      setLeadOpen(true);
                      trackGoal(metrikaId, METRIKA_GOALS.leadModalOpen, {
                        carId: car.id,
                        filterMode: "primary",
                      });
                    }}
                    onExpandFilters={expandFiltersAndRetry}
                    onRequestManualSelection={openManualLead}
                  />
                </section>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <Modal
        open={leadOpen}
        onClose={() => {
          setLeadOpen(false);
          setSelectedCar(undefined);
        }}
        title="Заявка на расчёт"
        description={
          selectedCar
            ? `${selectedCar.brand} ${selectedCar.model}, ${selectedCar.year}`
            : "Уточним детали по телефону"
        }
      >
        <LeadForm
          variant="plain"
          hideTitle
          context={leadContext}
          onSuccess={() => {
            window.setTimeout(() => {
              setLeadOpen(false);
              setSelectedCar(undefined);
            }, 1600);
          }}
        />
      </Modal>
    </div>
  );
}
