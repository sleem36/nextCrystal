"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { BookingModal } from "@/components/catalog/booking-modal";
import { CatalogCarCard } from "@/components/catalog/catalog-car-card";
import { FilterSidebar } from "@/components/catalog/filter-sidebar";
import { CatalogTrustStrip } from "@/components/catalog/catalog-trust-strip";
import { MobileStickyCatalogCta } from "@/components/catalog/mobile-sticky-catalog-cta";
import { QuizCatalogBanner } from "@/components/catalog/quiz-catalog-banner";
import { RecentlyViewed } from "@/components/catalog/recently-viewed";
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
];

type CatalogFaqItem = {
  question: string;
  answer: string;
};

function carsCountLabel(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) return "автомобиль";
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
    return "автомобиля";
  }
  return "автомобилей";
}

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
      <div className="mb-3 rounded-[var(--radius-card)] border border-emerald-200 bg-emerald-50/70 p-3 text-sm text-emerald-900">
        Не нашли подходящий вариант? Подберем вручную за 15 минут и свяжемся с вами.
      </div>
      <LeadForm context={context} variant="card" />
    </div>
  );
}

function CatalogFaqBlock({ items }: { items: CatalogFaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <section
      className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
      aria-labelledby="catalog-faq-heading"
    >
      <h2
        id="catalog-faq-heading"
        className="text-xl font-semibold text-[color:var(--color-brand-primary)]"
      >
        Частые вопросы
      </h2>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <details key={item.question} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">{item.question}</summary>
            <div
              className="prose prose-slate mt-2 max-w-none text-sm text-slate-700"
              dangerouslySetInnerHTML={{ __html: item.answer }}
            />
          </details>
        ))}
      </div>
    </section>
  );
}

export function CarsCatalogClient({
  cars,
  initialCars,
  initialFilters,
  basePath = "/cars",
  popularFilterLinks = [],
  faqItems = [],
}: {
  cars?: Car[];
  initialCars?: Car[];
  initialFilters?: Partial<CarListingFilters>;
  basePath?: string;
  popularFilterLinks?: Array<{ slug: string; name: string }>;
  faqItems?: CatalogFaqItem[];
}) {
  const sourceCars = useMemo(() => initialCars ?? cars ?? [], [initialCars, cars]);
  const { compareIds, toggle } = useCompareSelection();
  const { bookedIds, bookedUntilMap, refresh } = useBookedCars();
  const sp = useSearchParams();
  const router = useRouter();
  const metrikaId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || 0) || undefined;
  const [isPending, startTransition] = useTransition();

  const [leadModalState, setLeadModalState] = useState<{
    car: Car;
    type: "reservation" | "credit";
  } | null>(null);
  const [bookingSubmittingId, setBookingSubmittingId] = useState<string | null>(null);
  const [creditSubmittingId, setCreditSubmittingId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [canStickyFilters, setCanStickyFilters] = useState(false);

  const listLenRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const filtersAsideRef = useRef<HTMLElement | null>(null);

  const utm = useMemo(
    () => utmFromSearchParams(Object.fromEntries(sp.entries())),
    [sp],
  );

  const filters = useMemo(() => {
    const parsed = parseCarListingSearchParams(Object.fromEntries(sp.entries()));
    const merged = {
      ...parsed,
      ...(initialFilters ?? {}),
    };
    // Если город не задан в URL, подхватываем server-side город из cookie.
    if (sp.has("city")) {
      merged.city = parsed.city;
    }
    return merged;
  }, [sp, initialFilters]);

  const strictPriceBounds = useMemo(() => {
    const pool = filterCarsForPriceBounds(sourceCars, filters);
    if (pool.length === 0) {
      return { min: 0, max: 0 };
    }
    const prices = pool.map((c) => c.priceRub);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [sourceCars, filters]);

  const colorOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of sourceCars) {
      if (c.city === filters.city || c.cities?.includes(filters.city)) {
        set.add(c.color);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ru"));
  }, [sourceCars, filters.city]);

  const filtered = useMemo(() => filterCars(sourceCars, filters), [sourceCars, filters]);
  const relaxed = useMemo(
    () => (filtered.length === 0 ? getRelaxedSuggestions(sourceCars, filters) : []),
    [sourceCars, filters, filtered.length],
  );

  const showList = filtered.length > 0 ? filtered : relaxed;
  const isRelaxed = filtered.length === 0 && relaxed.length > 0;

  const priceBounds = useMemo(() => {
    const pool = filtered.length > 0 ? filtered : relaxed;
    if (pool.length === 0) {
      return strictPriceBounds;
    }
    const prices = pool.map((c) => c.priceRub);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [filtered, relaxed, strictPriceBounds]);

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

  const strictResultsCount = filtered.length;
  const resultsMotionKey = useMemo(() => JSON.stringify(filters), [filters]);

  const scrollCatalogToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
    startTransition(() => {
      router.push(`${basePath}?${params.toString()}`);
    });
    setFiltersOpen(false);
    scrollCatalogToTop();
  };

  const reset = () => {
    const params = carListingFiltersToSearchParams(DEFAULT_CAR_LISTING_FILTERS);
    for (const [key, value] of Object.entries(utm)) {
      params.set(key, value);
    }
    trackGoal(metrikaId, METRIKA_GOALS.catalogFiltersApplied, {
      action: "reset",
    });
    startTransition(() => {
      router.push(`${basePath}?${params.toString()}`);
    });
    setFiltersOpen(false);
    scrollCatalogToTop();
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
    const topOffsetPx = 96; // соответствует top-24
    const marginPx = 16;

    const updateStickyState = () => {
      const el = filtersAsideRef.current;
      if (!el || typeof window === "undefined") return;
      const requiredHeight = el.scrollHeight + topOffsetPx + marginPx;
      setCanStickyFilters(requiredHeight <= window.innerHeight);
    };

    updateStickyState();

    const resizeObserver = new ResizeObserver(() => {
      updateStickyState();
    });
    const el = filtersAsideRef.current;
    if (el) {
      resizeObserver.observe(el);
    }
    window.addEventListener("resize", updateStickyState);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateStickyState);
    };
  }, [filters]);

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

  const openLeadPopup = (car: Car, type: "reservation" | "credit") => {
    setLeadModalState({ car, type });
    trackGoal(metrikaId, METRIKA_GOALS.leadModalOpen, {
      type,
      carId: car.id,
    });
    trackGoal(metrikaId, METRIKA_GOALS.openLeadPopup, {
      type,
      carId: car.id,
      city: filters.city,
      paymentMethod: filters.paymentMethod,
    });
    if (type === "credit") {
      trackGoal(metrikaId, METRIKA_GOALS.clickCreditFromCard, {
        carId: car.id,
        city: filters.city,
      });
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <QuizCatalogBanner />

      <CatalogTrustStrip />

      <div className="flex flex-wrap gap-2">
        {popularFilterLinks.length > 0 ? (
          popularFilterLinks.map((item) => (
            <button
              key={item.slug}
              type="button"
              className={chipClass}
              onClick={() => {
                startTransition(() => {
                  router.push(`/cars/${item.slug}`);
                });
              }}
            >
              {item.name || item.slug}
            </button>
          ))
        ) : (
          <>
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
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 lg:hidden">
        <Button type="button" className="w-full" onClick={() => setFiltersOpen(true)}>
          Фильтры
        </Button>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside
          ref={filtersAsideRef}
          className={`hidden lg:block ${canStickyFilters ? "lg:sticky lg:top-24" : "lg:static"}`}
        >
          <FilterSidebar
            filters={filters}
            priceBounds={priceBounds}
            colorOptions={colorOptions}
            onApply={apply}
            onReset={reset}
          />
        </aside>

        <div className="relative min-w-0 space-y-4">
          {isPending ? (
            <div
              className="pointer-events-none absolute inset-0 z-20 rounded-[var(--radius-card)] bg-white/55 backdrop-blur-[1px] transition-opacity duration-200"
              aria-hidden
            />
          ) : null}
          <section className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="text-sm text-slate-700 md:text-base">
                  Найдено <strong>{strictResultsCount}</strong> {carsCountLabel(strictResultsCount)}
                </p>
                {isRelaxed ? (
                  <p className="text-xs text-amber-700">
                    По строгим фильтрам результатов нет, показано ближайших: <strong>{showList.length}</strong>
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="shrink-0 font-medium">Сортировка</span>
                  <select
                    className="h-10 min-w-[190px] rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900"
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
            </div>
          </section>

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

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={resultsMotionKey}
                  layout
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {visibleCars.map((car, index) => (
                    <motion.div
                      key={car.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{
                        duration: 0.22,
                        ease: "easeOut",
                        delay: Math.min(index * 0.05, 0.35),
                      }}
                    >
                      <CatalogCarCard
                        car={car}
                        animationIndex={index}
                        imagePriority={index < 4}
                        paymentMode={filters.paymentMethod}
                        isBooked={bookedIds.has(car.id)}
                        bookedUntilMs={bookedUntilMap[car.id] ?? null}
                        isBookingSubmitting={bookingSubmittingId === car.id}
                        isCreditSubmitting={creditSubmittingId === car.id}
                        onRequestBooking={(nextCar) => openLeadPopup(nextCar, "reservation")}
                        onRequestCredit={(nextCar) => openLeadPopup(nextCar, "credit")}
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
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

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
                <a
                  href="#catalog-lead"
                  className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] px-4 text-sm font-semibold text-[color:var(--color-brand-accent)] underline-offset-4 hover:underline"
                >
                  Подбор с менеджером
                </a>
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

      <RecentlyViewed cars={sourceCars} />

      <CatalogFaqBlock items={faqItems} />

      <CatalogLeadBlock filters={filters} utm={utm} />

      <BookingModal
        car={leadModalState?.car ?? null}
        type={leadModalState?.type ?? "reservation"}
        open={leadModalState != null}
        onClose={() => {
          setLeadModalState(null);
          setBookingSubmittingId(null);
          setCreditSubmittingId(null);
        }}
        filters={filters}
        utm={utm}
        onBooked={refresh}
        onSubmittingChange={(submitting, carId, type) => {
          if (type === "reservation") {
            setBookingSubmittingId(submitting ? carId : null);
            return;
          }
          setCreditSubmittingId(submitting ? carId : null);
        }}
      />

      <MobileStickyCatalogCta />
    </div>
  );
}
