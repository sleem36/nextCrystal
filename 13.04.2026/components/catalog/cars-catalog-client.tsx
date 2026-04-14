"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookingModal } from "@/components/catalog/booking-modal";
import { CatalogCarCard } from "@/components/catalog/catalog-car-card";
import { ComparePanel } from "@/components/catalog/compare-panel";
import { FilterSidebar } from "@/components/catalog/filter-sidebar";
import { QuickViewModal } from "@/components/catalog/quick-view-modal";
import { RecentlyViewed } from "@/components/catalog/recently-viewed";
import { QuizCatalogBanner } from "@/components/catalog/quiz-catalog-banner";
import { LeadForm } from "@/components/landing/lead-form";
import { Button } from "@/components/ui/button";
import { useBookedCars } from "@/hooks/use-booked-cars";
import { useCompareSelection } from "@/hooks/use-compare-selection";
import { METRIKA_GOALS, trackGoal } from "@/lib/analytics";
import {
  carListingFiltersToSearchParams,
  DEFAULT_CAR_LISTING_FILTERS,
  filterCars,
  filterCarsForPriceBounds,
  getRelaxedSuggestions,
  parseCarListingSearchParams,
  type CarListingFilters,
} from "@/lib/car-filters";
import { sortCatalogCars } from "@/lib/car-listing-enrichment";
import { utmFromSearchParams } from "@/lib/utm";
import type { Car } from "@/types/car";

const PAGE_SIZE = 12;

const SORT_OPTIONS: Array<{ value: CarListingFilters["sort"]; label: string }> = [
  { value: "default", label: "По умолчанию" },
  { value: "price_asc", label: "Цена: сначала дешевле" },
  { value: "price_desc", label: "Цена: сначала дороже" },
  { value: "year_desc", label: "Год: новее" },
  { value: "year_asc", label: "Год: старше" },
  { value: "mileage_asc", label: "Пробег: меньше" },
  { value: "mileage_desc", label: "Пробег: больше" },
  { value: "popular_desc", label: "Популярность" },
];

function CatalogLeadBlock({
  filters,
  utm,
}: {
  filters: CarListingFilters;
  utm: Record<string, string>;
}) {
  const context = useMemo(
    () => ({
      city: filters.city,
      carId: undefined as string | undefined,
      paymentMethod: filters.paymentMethod,
      monthlyBudget: filters.paymentMethod === "credit" ? filters.monthlyBudget : undefined,
      maxPriceRub: filters.maxPriceRub,
      bodyType: filters.bodyType,
      transmission: filters.transmission,
      drive: filters.drive,
      fuel: filters.fuel,
      yearFrom: filters.yearFrom,
      maxMileageKm: filters.maxMileageKm,
      purchaseGoal: undefined,
      utm,
    }),
    [filters, utm],
  );

  return (
    <div id="catalog-lead" className="scroll-mt-28">
      <LeadForm context={context} variant="card" />
    </div>
  );
}

export function CarsCatalogClient({ cars }: { cars: Car[] }) {
  const { compareIds, toggle, setCompareIds } = useCompareSelection();
  const { bookedIds, bookedUntilMap, refresh } = useBookedCars();
  const sp = useSearchParams();
  const router = useRouter();
  const metrikaId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || 0) || undefined;

  const [bookingCar, setBookingCar] = useState<Car | null>(null);
  const [bookingSubmittingId, setBookingSubmittingId] = useState<string | null>(null);
  const [quickCar, setQuickCar] = useState<Car | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const listLenRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const utm = useMemo(
    () => utmFromSearchParams(Object.fromEntries(sp.entries())),
    [sp],
  );

  const filters = useMemo(
    () => parseCarListingSearchParams(Object.fromEntries(sp.entries())),
    [sp],
  );

  const carsById = useMemo(() => new Map(cars.map((c) => [c.id, c])), [cars]);

  const priceBounds = useMemo(() => {
    const pool = filterCarsForPriceBounds(cars, filters);
    if (pool.length === 0) {
      return { min: 0, max: 1 };
    }
    const prices = pool.map((c) => c.priceRub);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [cars, filters]);

  const colorOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of cars) {
      if (c.city === filters.city) {
        set.add(c.color);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ru"));
  }, [cars, filters.city]);

  const filtered = useMemo(() => filterCars(cars, filters), [cars, filters]);
  const relaxed = useMemo(
    () => (filtered.length === 0 ? getRelaxedSuggestions(cars, filters) : []),
    [cars, filters, filtered.length],
  );

  const showList = filtered.length > 0 ? filtered : relaxed;
  const isRelaxed = filtered.length === 0 && relaxed.length > 0;

  const sortedList = useMemo(
    () => sortCatalogCars(showList, filters.sort),
    [showList, filters.sort],
  );

  listLenRef.current = sortedList.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters, sortedList.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || sortedList.length === 0) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) {
          return;
        }
        setVisibleCount((prev) => {
          if (prev >= listLenRef.current) {
            return prev;
          }
          return Math.min(prev + PAGE_SIZE, listLenRef.current);
        });
      },
      { root: null, rootMargin: "240px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [sortedList.length]);

  const visibleCars = useMemo(
    () => sortedList.slice(0, visibleCount),
    [sortedList, visibleCount],
  );

  const apply = (f: CarListingFilters) => {
    const params = carListingFiltersToSearchParams(f);
    for (const [key, value] of Object.entries(utm)) {
      params.set(key, value);
    }
    trackGoal(metrikaId, METRIKA_GOALS.catalogFiltersApplied, {
      action: "apply",
      paymentMethod: f.paymentMethod,
      city: f.city,
      ...(f.paymentMethod === "credit" ? { monthlyBudget: f.monthlyBudget } : {}),
      maxPriceRub: f.maxPriceRub,
      bodyType: f.bodyType,
      transmission: f.transmission,
    });
    router.push(`/cars?${params.toString()}`);
    setFiltersOpen(false);
  };

  const reset = () => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(utm)) {
      params.set(key, value);
    }
    trackGoal(metrikaId, METRIKA_GOALS.catalogFiltersApplied, {
      action: "reset",
    });
    const query = params.toString();
    router.push(query ? `/cars?${query}` : "/cars");
    setFiltersOpen(false);
  };

  useEffect(() => {
    trackGoal(metrikaId, METRIKA_GOALS.catalogOpened, {
      paymentMethod: filters.paymentMethod,
      city: filters.city,
      ...(filters.paymentMethod === "credit" ? { monthlyBudget: filters.monthlyBudget } : {}),
      maxPriceRub: filters.maxPriceRub,
      bodyType: filters.bodyType,
      transmission: filters.transmission,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- только при первом открытии каталога
  }, []);

  useEffect(() => {
    if (showList.length > 0) return;
    trackGoal(metrikaId, METRIKA_GOALS.noResultsShown, {
      paymentMethod: filters.paymentMethod,
      city: filters.city,
      ...(filters.paymentMethod === "credit" ? { monthlyBudget: filters.monthlyBudget } : {}),
      maxPriceRub: filters.maxPriceRub,
      bodyType: filters.bodyType,
      transmission: filters.transmission,
    });
  }, [filters, metrikaId, showList.length]);

  const chipClass =
    "inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-[color:var(--color-brand-accent)] hover:text-[color:var(--color-brand-accent)]";

  const compareBarActive = compareIds.length >= 2;

  return (
    <div className={`space-y-6 ${compareBarActive ? "pb-28 md:pb-32" : ""}`}>
      <QuizCatalogBanner />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={chipClass}
          onClick={() =>
            apply({
              ...filters,
              maxPriceRub: 1_000_000,
              priceMinRub: 0,
            })
          }
        >
          До 1 млн ₽
        </button>
        <button
          type="button"
          className={chipClass}
          onClick={() =>
            apply({
              ...filters,
              maxMileageKm: 50_000,
            })
          }
        >
          Пробег до 50 000 км
        </button>
        <button
          type="button"
          className={chipClass}
          onClick={() =>
            apply({
              ...filters,
              hasVideoOnly: true,
            })
          }
        >
          Только с видеообзором
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 lg:hidden">
        <Button type="button" className="flex-1" onClick={() => setFiltersOpen(true)}>
          Фильтры
        </Button>
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-slate-600">
          <span className="sr-only">Сортировка</span>
          <select
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900"
            value={filters.sort}
            onChange={(e) =>
              apply({
                ...filters,
                sort: e.target.value as CarListingFilters["sort"],
              })
            }
            aria-label="Сортировка"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside className="hidden lg:block lg:sticky lg:top-24">
          <FilterSidebar
            filters={filters}
            priceBounds={priceBounds}
            colorOptions={colorOptions}
            onApply={apply}
            onReset={reset}
          />
        </aside>

        <div className="min-w-0 space-y-4">
          <div className="hidden items-center justify-between gap-4 lg:flex">
            {showList.length > 0 ? (
              <p className="text-sm text-slate-600">
                Найдено: <strong>{isRelaxed ? showList.length : filtered.length}</strong>{" "}
                {(isRelaxed ? showList.length : filtered.length) === 1
                  ? "автомобиль"
                  : (isRelaxed ? showList.length : filtered.length) < 5
                    ? "автомобиля"
                    : "автомобилей"}
              </p>
            ) : (
              <span />
            )}
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <span className="shrink-0 font-medium">Сортировка</span>
              <select
                className="h-11 min-w-[220px] rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900"
                value={filters.sort}
                onChange={(e) =>
                  apply({
                    ...filters,
                    sort: e.target.value as CarListingFilters["sort"],
                  })
                }
                aria-label="Сортировка"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {showList.length > 0 ? (
            <section className="space-y-4" aria-label="Список автомобилей">
              {isRelaxed ? (
                <div className="rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  По текущим фильтрам ничего не нашлось — показаны{" "}
                  <strong>ближайшие по параметрам</strong> (смягчены{" "}
                  {filters.paymentMethod === "credit" ? "платёж, " : ""}цена, год и пробег). Попробуйте
                  изменить город или КПП — или оставьте заявку ниже.
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
                {visibleCars.map((car, index) => (
                  <CatalogCarCard
                    key={car.id}
                    car={car}
                    animationIndex={index}
                    imagePriority={index < 4}
                    isBooked={bookedIds.has(car.id)}
                    bookedUntilMs={bookedUntilMap[car.id] ?? null}
                    isBookingSubmitting={bookingSubmittingId === car.id}
                    onQuickView={setQuickCar}
                    onRequestBooking={setBookingCar}
                    compare={{
                      checked: compareIds.includes(car.id),
                      disabled: !compareIds.includes(car.id) && compareIds.length >= 3,
                      onToggle: () => {
                        const willAdd = !compareIds.includes(car.id);
                        toggle(car.id);
                        trackGoal(
                          metrikaId,
                          willAdd ? METRIKA_GOALS.compareAdd : METRIKA_GOALS.compareRemove,
                          {
                            carId: car.id,
                            paymentMethod: filters.paymentMethod,
                            city: filters.city,
                            ...(filters.paymentMethod === "credit"
                              ? { monthlyBudget: filters.monthlyBudget }
                              : {}),
                            maxPriceRub: filters.maxPriceRub,
                            bodyType: filters.bodyType,
                            transmission: filters.transmission,
                          },
                        );
                      },
                    }}
                  />
                ))}
              </div>

              {visibleCount < sortedList.length ? (
                <div ref={sentinelRef} className="flex h-16 items-center justify-center text-sm text-slate-500">
                  Загрузка…
                </div>
              ) : (
                <div ref={sentinelRef} className="h-px w-full" aria-hidden />
              )}
            </section>
          ) : (
            <section className="space-y-4 rounded-[var(--radius-card)] border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <h2 className="text-lg font-semibold text-[color:var(--color-brand-primary)]">
                Нет подходящих вариантов
              </h2>
              <p>
                Попробуйте расширить фильтры или оставьте заявку — подберём авто вручную и перезвоним с
                вариантами.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={reset}>
                  Сбросить фильтры
                </Button>
                <Button type="button" variant="secondary" onClick={() => apply(DEFAULT_CAR_LISTING_FILTERS)}>
                  Вернуть значения по умолчанию
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Закрыть фильтры"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(100%,380px)] flex-col border-r border-slate-200 bg-[var(--background)] shadow-xl">
            <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-semibold text-[color:var(--color-brand-primary)]">
                  Фильтры
                </span>
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Закрыть панель фильтров"
                >
                  ✕
                </button>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="h-10 w-full text-sm"
                onClick={() => reset()}
              >
                Сбросить все фильтры
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <FilterSidebar
                filters={filters}
                priceBounds={priceBounds}
                colorOptions={colorOptions}
                onApply={apply}
                onReset={reset}
              />
            </div>
          </div>
        </div>
      ) : null}

      <RecentlyViewed cars={cars} />

      <CatalogLeadBlock filters={filters} utm={utm} />

      <BookingModal
        car={bookingCar}
        open={bookingCar != null}
        onClose={() => {
          setBookingCar(null);
          setBookingSubmittingId(null);
        }}
        filters={filters}
        utm={utm}
        onBooked={refresh}
        onSubmittingChange={(submitting, carId) => {
          setBookingSubmittingId(submitting ? carId : null);
        }}
      />

      <QuickViewModal
        car={quickCar}
        open={quickCar != null}
        onClose={() => setQuickCar(null)}
        onBook={(car) => {
          setQuickCar(null);
          setBookingCar(car);
        }}
      />

      <ComparePanel
        compareIds={compareIds}
        carsById={carsById}
        onRemove={(id) => setCompareIds(compareIds.filter((x) => x !== id))}
        onClear={() => setCompareIds([])}
      />
    </div>
  );
}
