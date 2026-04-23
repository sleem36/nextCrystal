"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Banknote,
  CalendarClock,
  Car as CarIcon,
  CarFront,
  CircleHelp,
  Cog,
  Clock3,
  FileCheck2,
  Gauge,
  Handshake,
  KeyRound,
  Mountain,
  Route,
  SearchCheck,
  ShieldCheck,
  type LucideIcon,
  Users,
  Wallet,
} from "lucide-react";
import { CarResults } from "@/components/landing/car-results";
import { HeroCompact } from "@/components/landing/hero-compact";
import { LeadForm } from "@/components/landing/lead-form";
import { QuickSelector, SelectorState } from "@/components/landing/quick-selector";
import { SelectionSummary } from "@/components/landing/selection-summary";
import { Modal } from "@/components/ui/modal";
import { METRIKA_GOALS, trackGoal } from "@/lib/analytics";
import { getResolvedCarImages } from "@/lib/car-images-map";
import { formatCurrency } from "@/lib/format";
import { IMAGE_BLUR_DATA_URL } from "@/lib/image-blur-placeholder";
import { shouldUnoptimizeRemoteImage } from "@/lib/remote-image";
import { buildCarsUrlFromQuiz, saveQuizAnswers } from "@/lib/quiz-answers";
import { Car } from "@/types/car";

const metrikaId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || 0) || undefined;

type LandingMvpProps = {
  initialCars: Car[];
};

const quickCollections: Array<{
  label: string;
  href: string;
  icon: LucideIcon;
}> = [
  {
    label: "С АКПП",
    href: "/cars?paymentMethod=cash&transmission=automatic&city=%D0%91%D0%B0%D1%80%D0%BD%D0%B0%D1%83%D0%BB",
    icon: Cog,
  },
  {
    label: "Кроссоверы",
    href: "/cars?paymentMethod=cash&bodyType=suv&city=%D0%91%D0%B0%D1%80%D0%BD%D0%B0%D1%83%D0%BB",
    icon: Mountain,
  },
  {
    label: "Семейные",
    href: "/cars?paymentMethod=cash&bodyType=suv&maxPriceRub=2500000&city=%D0%91%D0%B0%D1%80%D0%BD%D0%B0%D1%83%D0%BB",
    icon: Users,
  },
  {
    label: "До 2 млн",
    href: "/cars?paymentMethod=cash&maxPriceRub=2000000&city=%D0%91%D0%B0%D1%80%D0%BD%D0%B0%D1%83%D0%BB",
    icon: Wallet,
  },
  {
    label: "Свежие от 2020",
    href: "/cars?paymentMethod=cash&yearFrom=2020&city=%D0%91%D0%B0%D1%80%D0%BD%D0%B0%D1%83%D0%BB",
    icon: CalendarClock,
  },
  {
    label: "Малый пробег",
    href: "/cars?paymentMethod=cash&maxMileageKm=80000&city=%D0%91%D0%B0%D1%80%D0%BD%D0%B0%D1%83%D0%BB",
    icon: Route,
  },
  {
    label: "Седаны",
    href: "/cars?paymentMethod=cash&bodyType=sedan&city=%D0%91%D0%B0%D1%80%D0%BD%D0%B0%D1%83%D0%BB",
    icon: CarIcon,
  },
  {
    label: "Полный привод",
    href: "/cars?paymentMethod=cash&drive=awd&city=%D0%91%D0%B0%D1%80%D0%BD%D0%B0%D1%83%D0%BB",
    icon: CarFront,
  },
];

const faqPreview = [
  {
    q: "Можно ли оформить кредит без первоначального взноса?",
    a: "Да, зависит от банка и конкретного автомобиля. Подберем оптимальные условия под ваш бюджет.",
  },
  {
    q: "Проверяете ли авто перед продажей?",
    a: "Каждый автомобиль проходит диагностику и юридическую проверку перед попаданием в каталог.",
  },
  {
    q: "Можно ли забронировать авто дистанционно?",
    a: "Да, можно оставить заявку, получить подтверждение и зафиксировать автомобиль до приезда.",
  },
];

export function LandingMvp({ initialCars }: LandingMvpProps) {
  const [selectedCar, setSelectedCar] = useState<Car | undefined>();
  const [leadOpen, setLeadOpen] = useState(false);
  const [funnelOpen, setFunnelOpen] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const quickSelectorRef = useRef<HTMLDivElement | null>(null);
  const resultsRef = useRef<HTMLElement | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);
  const resultsHighlightTimeoutRef = useRef<number | null>(null);

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

  const skipCatalogHref = useMemo(() => {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(utm)) {
      if (val) params.set(key, val);
    }
    const query = params.toString();
    return query ? `/cars?${query}` : "/cars";
  }, [utm]);

  const catalogFromQuizHref = useMemo(
    () => buildCarsUrlFromQuiz(selector, utm),
    [selector, utm],
  );
  const featuredCars = useMemo(
    () =>
      [...cars]
        .sort((a, b) => (b.bookingCount ?? b.viewCount ?? 0) - (a.bookingCount ?? a.viewCount ?? 0))
        .slice(0, 6),
    [cars],
  );
  const trustStats = useMemo(
    () => ({
      carsInStock: cars.length,
      avgResponseMinutes: "5-10",
    }),
    [cars.length],
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

  const focusQuizResults = useCallback(() => {
    const target = resultsRef.current;
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
    if (resultsHighlightTimeoutRef.current) {
      window.clearTimeout(resultsHighlightTimeoutRef.current);
    }
    resultsHighlightTimeoutRef.current = window.setTimeout(() => {
      target.classList.remove("focus-target-highlight");
      resultsHighlightTimeoutRef.current = null;
    }, 1300);
  }, []);

  useEffect(() => {
    if (!quizComplete) return;
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        focusQuizResults();
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [quizComplete, focusQuizResults]);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
      if (resultsHighlightTimeoutRef.current) {
        window.clearTimeout(resultsHighlightTimeoutRef.current);
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
      <section className="container-wide rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-6">
        <h2 className="text-xl font-semibold text-[color:var(--color-brand-primary)]">Почему выбирают нас</h2>
        <p className="mt-2 text-sm text-slate-600">
          В наличии <strong>{trustStats.carsInStock}</strong> авто. Ответ менеджера обычно в течение{" "}
          <strong>{trustStats.avgResponseMinutes} минут</strong>.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden />
            <p className="mt-2 text-sm font-semibold text-slate-900">Проверенные автомобили</p>
            <p className="mt-1 text-xs text-slate-600">Диагностика состояния и юридическая чистота сделки.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <BadgeCheck className="h-5 w-5 text-sky-600" aria-hidden />
            <p className="mt-2 text-sm font-semibold text-slate-900">Прозрачные условия</p>
            <p className="mt-1 text-xs text-slate-600">Без скрытых услуг и навязанных доплат.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <Banknote className="h-5 w-5 text-indigo-600" aria-hidden />
            <p className="mt-2 text-sm font-semibold text-slate-900">Подбор под платеж</p>
            <p className="mt-1 text-xs text-slate-600">Помогаем уложиться в комфортный ежемесячный бюджет.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <Clock3 className="h-5 w-5 text-amber-600" aria-hidden />
            <p className="mt-2 text-sm font-semibold text-slate-900">Сопровождение сделки</p>
            <p className="mt-1 text-xs text-slate-600">Помогаем с документами и выдачей автомобиля без лишних шагов.</p>
          </div>
        </div>
      </section>

      <section className="container-wide rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-[color:var(--color-brand-primary)]">Популярные автомобили в наличии</h2>
          <Link href="/cars" className="text-sm font-semibold text-[color:var(--color-brand-accent)] hover:underline">
            Смотреть весь каталог
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {featuredCars.map((car, index) => {
            const coverSrc = getResolvedCarImages(car)[0];
            const coverUnoptimized = shouldUnoptimizeRemoteImage(coverSrc);
            return (
              <Link
                key={car.id}
                href={`/cars/${car.id}`}
                className="group flex min-h-0 flex-col overflow-hidden rounded-[var(--radius-card)] border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] motion-reduce:transform-none"
                onClick={() =>
                  trackGoal(metrikaId, METRIKA_GOALS.homeFeaturedCarClick, {
                    carId: car.id,
                  })
                }
              >
                <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-t-[var(--radius-card)] bg-white">
                  <Image
                    src={coverSrc}
                    alt={`${car.brand} ${car.model}, ${car.year}`}
                    fill
                    className="object-cover object-bottom transition duration-200 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    priority={index < 4}
                    unoptimized={coverUnoptimized}
                    placeholder={coverUnoptimized ? "empty" : "blur"}
                    blurDataURL={coverUnoptimized ? undefined : IMAGE_BLUR_DATA_URL}
                  />
                </div>
                <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2.5">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-slate-900">
                    {car.brand} {car.model}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {car.year} · {car.mileageKm.toLocaleString("ru-RU")} км
                  </p>
                  <p className="mt-auto pt-2 text-base font-semibold tabular-nums tracking-tight text-[color:var(--color-brand-primary)]">
                    {formatCurrency(car.priceRub)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-wide rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-6">
        <h2 className="text-xl font-semibold text-[color:var(--color-brand-primary)]">Быстрые подборки</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {quickCollections.map((item) => {
            const ItemIcon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)]"
                onClick={() =>
                  trackGoal(metrikaId, METRIKA_GOALS.homeQuickCollectionClick, {
                    label: item.label,
                  })
                }
              >
                <div className="flex items-center gap-1.5 px-2 py-1.5">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-brand-accent)]/10 text-[color:var(--color-brand-accent)]">
                    <ItemIcon className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <p className="whitespace-nowrap text-[11px] font-semibold text-slate-900 transition group-hover:text-[color:var(--color-brand-accent)] sm:text-xs">
                    {item.label}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-wide grid gap-4 lg:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-6">
          <h2 className="text-xl font-semibold text-[color:var(--color-brand-primary)]">Как проходит покупка</h2>
          <ol className="mt-4 list-none space-y-3 p-0 text-sm text-slate-700">
            <li className="flex items-center gap-3 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-3 shadow-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color:var(--color-brand-accent)]/12 text-[color:var(--color-brand-accent)] ring-1 ring-[color:var(--color-brand-accent)]/20">
                <SearchCheck className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 leading-snug">
                Подбираем варианты под ваш бюджет и задачи.
              </span>
            </li>
            <li className="flex items-center gap-3 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-3 shadow-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/20">
                <ShieldCheck className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 leading-snug">
                Проверяем историю, состояние и документы авто.
              </span>
            </li>
            <li className="flex items-center gap-3 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-3 shadow-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/12 text-violet-700 ring-1 ring-violet-500/20">
                <Handshake className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 leading-snug">
                Согласовываем условия покупки или кредита.
              </span>
            </li>
            <li className="flex items-center gap-3 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-3 shadow-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/12 text-amber-800 ring-1 ring-amber-500/25">
                <KeyRound className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 leading-snug">
                Оформляем сделку и передаем автомобиль.
              </span>
            </li>
          </ol>
        </div>
        <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-6">
          <h2 className="text-xl font-semibold text-[color:var(--color-brand-primary)]">Кредит и условия</h2>
          <p className="mt-3 text-sm text-slate-700">
            Подбираем программу под ваш платеж и помогаем с одобрением. Предложим несколько сценариев с разным сроком и первоначальным взносом.
          </p>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            Условия кредитования зависят от банка-партнера, возраста авто и вашей кредитной истории.
          </div>
          <button
            type="button"
            className="mt-4 inline-flex h-10 items-center rounded-[var(--radius-button)] bg-[color:var(--color-brand-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-accent-hover)]"
            onClick={() => {
              trackGoal(metrikaId, METRIKA_GOALS.homeFinalCtaClick, { source: "credit_info" });
              openFunnel();
              window.setTimeout(focusQuickSelector, 80);
            }}
          >
            Подобрать условия
          </button>
        </div>
      </section>

      <section className="container-wide rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-6">
        <h2 className="text-xl font-semibold text-[color:var(--color-brand-primary)]">Частые вопросы</h2>
        <div className="mt-4 space-y-2">
          {faqPreview.map((item) => (
            <details key={item.q} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900">
                <span className="inline-flex items-center gap-2">
                  <CircleHelp className="h-4 w-4 text-slate-500" aria-hidden />
                  {item.q}
                </span>
              </summary>
              <p className="mt-2 text-sm text-slate-700">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="container-wide rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--color-brand-primary)]">Нужна помощь с выбором?</h2>
            <p className="mt-1 text-sm text-slate-600">Подберем несколько вариантов и свяжемся с вами в ближайшее время.</p>
          </div>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] bg-[color:var(--color-brand-accent)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-accent-hover)]"
            onClick={() => {
              trackGoal(metrikaId, METRIKA_GOALS.homeFinalCtaClick, { source: "final_block" });
              openFunnel();
              window.setTimeout(focusQuickSelector, 80);
            }}
          >
            Оставить заявку
          </button>
        </div>
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <p className="inline-flex items-center gap-2 font-medium">
            <FileCheck2 className="h-4 w-4 text-slate-500" aria-hidden />
            Консультация бесплатная. Ответ менеджера обычно в течение 5-10 минут.
          </p>
        </div>
      </section>

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
                skipCatalogHref={skipCatalogHref}
                onSkipCatalog={() => {
                  trackGoal(metrikaId, METRIKA_GOALS.quizSkipCatalogClick);
                }}
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
                  ref={resultsRef}
                  className="space-y-4 rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-opacity duration-[var(--motion-panel)] motion-reduce:transition-none md:p-5 lg:p-6"
                  id="results"
                  tabIndex={-1}
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
