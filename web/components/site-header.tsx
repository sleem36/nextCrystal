"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Heart, MapPin, Menu, Phone, Scale, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useCompareSelection } from "@/hooks/use-compare-selection";
import { METRIKA_GOALS, trackGoal } from "@/lib/analytics";
import { setCityCookie } from "@/lib/city-cookie";
import { contactSite, telHref } from "@/lib/contact-site";
import { useWishlistStore } from "@/stores/wishlist-store";

const desktopNav = [
  { href: "/cars", label: "Каталог" },
  { href: "/about", label: "О компании" },
  { href: "/contacts", label: "Контакты" },
];

const catalogBodyTypeLinks = [
  { href: "/cars?bodyType=suv", label: "Кроссоверы и SUV" },
  { href: "/cars?bodyType=sedan", label: "Седаны" },
  { href: "/cars?bodyType=hatchback", label: "Хэтчбеки" },
  { href: "/cars?bodyType=liftback", label: "Лифтбеки" },
];

const CITY_COOKIE_KEY = "selected_city";

/** Одинаковая высота (40px), радиус и обводка для полей и кнопок в шапке */
const headerControlChrome =
  "box-border h-10 min-h-10 border border-slate-300 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]";

const headerControlRounded = "rounded-xl";

const headerIconButtonClass = `relative inline-flex size-10 shrink-0 items-center justify-center ${headerControlRounded} ${headerControlChrome} text-slate-700 transition hover:bg-slate-50`;

function navRouteActive(pathname: string, href: string): boolean {
  if (href === "/cars") {
    return pathname === "/cars" || pathname.startsWith("/cars/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Пункты меню: фиксированная высота h-10 как у поиска/города; активный — только линия + цвет (без тяжёлой заливки) */
function navMenuSurfaceClass(active: boolean): string {
  return [
    "group/nav relative inline-flex h-10 shrink-0 items-center overflow-visible px-2.5 text-sm font-medium outline-none transition-colors duration-300",
    active
      ? "text-[color:var(--color-brand-accent)]"
      : "text-slate-700 hover:text-[color:var(--color-brand-accent)]",
  ].join(" ");
}

function navMenuUnderlineClass(active: boolean): string {
  return [
    "pointer-events-none absolute bottom-0 left-2 right-2 h-0.5 origin-left rounded-full bg-[color:var(--color-brand-accent)] transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] motion-reduce:duration-150",
    active
      ? "scale-x-100"
      : "scale-x-0 group-hover/nav:scale-x-100",
  ].join(" ");
}

type CityOption = {
  id: number;
  slug: string;
  name_imya: string;
};

type CallbackFormState = {
  name: string;
  phone: string;
};

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const metrikaId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || 0) || undefined;
  const { compareIds } = useCompareSelection();
  const wishlistIds = useWishlistStore((state) => state.ids);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [desktopSearchValue, setDesktopSearchValue] = useState("");
  const [mobileSearchValue, setMobileSearchValue] = useState("");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState<CityOption[]>([]);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [callbackState, setCallbackState] = useState<CallbackFormState>({ name: "", phone: "" });
  const [callbackSubmitting, setCallbackSubmitting] = useState(false);
  const [callbackError, setCallbackError] = useState("");
  const catalogCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const compareCount = compareIds.length;
  const wishlistCount = wishlistIds.length;
  const compareCountLabel = compareCount > 99 ? "99+" : String(compareCount);
  const wishlistCountLabel = wishlistCount > 99 ? "99+" : String(wishlistCount);
  const phoneHref = telHref(contactSite.phoneDigits);

  const canSubmitCallback = useMemo(
    () => callbackState.name.trim().length > 1 && callbackState.phone.trim().length >= 6,
    [callbackState],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMobileMenuOpen(false);
      setSearchOpen(false);
      setCatalogOpen(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch("/api/cities", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { cities?: CityOption[] };
        const loadedCities = payload.cities ?? [];
        setCities(loadedCities);

        const cookieCitySlug = document.cookie
          .split("; ")
          .find((row) => row.startsWith(`${CITY_COOKIE_KEY}=`))
          ?.split("=")[1];
        const decodedCookieCitySlug = cookieCitySlug ? decodeURIComponent(cookieCitySlug) : "";
        if (decodedCookieCitySlug) {
          const selected = loadedCities.find((item) => item.slug === decodedCookieCitySlug);
          if (selected) {
            setCity(selected.slug);
            return;
          }
        }
        if (loadedCities.length > 0) {
          setCity(loadedCities[0].slug);
        }
      } catch {
        // Ignore network errors: city picker remains hidden.
      }
    };
    void fetchCities();
  }, []);

  useEffect(
    () => () => {
      if (catalogCloseTimerRef.current) {
        clearTimeout(catalogCloseTimerRef.current);
      }
    },
    [],
  );

  const openCatalogMenu = () => {
    if (catalogCloseTimerRef.current) {
      clearTimeout(catalogCloseTimerRef.current);
      catalogCloseTimerRef.current = null;
    }
    setCatalogOpen(true);
  };

  const closeCatalogMenuWithDelay = () => {
    if (catalogCloseTimerRef.current) {
      clearTimeout(catalogCloseTimerRef.current);
    }
    catalogCloseTimerRef.current = setTimeout(() => {
      setCatalogOpen(false);
      catalogCloseTimerRef.current = null;
    }, 160);
  };

  const submitSearch = (event: FormEvent, value: string) => {
    event.preventDefault();
    const query = value.trim();
    if (!query) {
      router.push("/cars");
    } else {
      router.push(`/cars?search=${encodeURIComponent(query)}`);
    }
    setMobileMenuOpen(false);
    setCatalogOpen(false);
    setSearchOpen(false);
  };

  const submitCallback = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmitCallback || callbackSubmitting) return;
    setCallbackError("");
    setCallbackSubmitting(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    const payload = {
      name: callbackState.name.trim(),
      phone: callbackState.phone.trim(),
      source: "header_callback",
      page: pathname,
    };
    fetch("/api/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error || "Не удалось отправить форму.");
        }
        trackGoal(metrikaId, METRIKA_GOALS.submitLeadSuccess, { leadType: "header_callback" });
        setCallbackOpen(false);
        setCallbackState({ name: "", phone: "" });
      })
      .catch((error) => {
        const message =
          error instanceof DOMException && error.name === "AbortError"
            ? "Сервер долго отвечает. Попробуйте ещё раз."
            : error instanceof Error
              ? error.message
              : "Не удалось отправить форму.";
        trackGoal(metrikaId, METRIKA_GOALS.submitLeadError, { leadType: "header_callback" });
        setCallbackError(message);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setCallbackSubmitting(false);
      });
  };

  const applyCitySlug = (slug: string) => {
    setCity(slug);
    setCityCookie(slug);
    router.refresh();
    setCityModalOpen(false);
  };

  const currentCityLabel = useMemo(() => {
    const found = cities.find((c) => c.slug === city);
    return found?.name_imya ?? (city || "Город");
  }, [cities, city]);

  const catalogRouteActive = navRouteActive(pathname, "/cars");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/90 shadow-[0_2px_10px_rgba(15,23,42,0.04)] backdrop-blur-md">
        <div className="container-wide flex h-[60px] items-center gap-2 md:h-[74px] md:gap-3 lg:gap-4">
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`${headerIconButtonClass} md:hidden`}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>

          <Link href="/" className="min-w-0 w-[200px] shrink-0" aria-label="Aurora Auto — на главную">
            <Image
              src="/brand/aurora-auto-logo.svg"
              alt="Aurora Auto"
              width={189}
              height={33}
              priority
              className="h-auto w-full"
            />
          </Link>

          <div
            className={`hidden min-w-0 shrink-0 items-center gap-1.5 px-3 text-sm font-semibold text-slate-700 md:inline-flex ${headerControlChrome} ${headerControlRounded}`}
          >
            <MapPin className="h-4 w-4 shrink-0 text-[color:var(--color-brand-accent)]" aria-hidden />
            <button
              type="button"
              onClick={() => setCityModalOpen(true)}
              disabled={cities.length === 0}
              className="inline-flex h-full min-h-0 max-w-[200px] items-center gap-1 truncate bg-transparent text-sm font-semibold outline-none transition hover:text-[color:var(--color-brand-accent)] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Выбрать город"
              aria-haspopup="dialog"
              aria-expanded={cityModalOpen}
            >
              <span className="truncate">{cities.length === 0 ? "Загрузка…" : currentCityLabel}</span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
            </button>
          </div>

          <nav className="relative hidden items-center gap-1 sm:gap-2 lg:gap-3 text-sm lg:flex">
            <div
              className="relative"
              onMouseEnter={openCatalogMenu}
              onMouseLeave={closeCatalogMenuWithDelay}
              onFocus={openCatalogMenu}
              onBlur={(event) => {
                const nextTarget = event.relatedTarget;
                if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
                  return;
                }
                closeCatalogMenuWithDelay();
              }}
            >
              <div
                className={`inline-flex h-10 min-h-10 items-stretch overflow-hidden ${headerControlChrome} ${headerControlRounded}`}
              >
                <Link
                  href="/cars"
                  className={`${navMenuSurfaceClass(catalogRouteActive)} rounded-none pr-1.5 pl-2`}
                  aria-current={catalogRouteActive ? "page" : undefined}
                  onClick={() => setCatalogOpen(false)}
                >
                  <span className="relative z-10">Каталог</span>
                  <span aria-hidden className={navMenuUnderlineClass(catalogRouteActive)} />
                </Link>
                <button
                  type="button"
                  className={`inline-flex h-full min-h-0 w-9 shrink-0 items-center justify-center rounded-none border-l border-slate-200/90 border-t-0 border-b-0 border-r-0 bg-transparent text-slate-600 transition-colors duration-300 hover:bg-slate-50 hover:text-[color:var(--color-brand-accent)] ${
                    catalogRouteActive ? "text-[color:var(--color-brand-accent)]" : ""
                  }`}
                  aria-expanded={catalogOpen}
                  aria-label="Подкатегории каталога"
                  onClick={() => setCatalogOpen((prev) => !prev)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setCatalogOpen(false);
                    }
                  }}
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ease-out ${catalogOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
              </div>
              <div
                className={`absolute left-0 top-full z-50 w-72 origin-top rounded-xl border border-slate-200 bg-white p-3 shadow-xl transition duration-150 ${
                  catalogOpen
                    ? "pointer-events-auto translate-y-1 scale-100 opacity-100"
                    : "pointer-events-none -translate-y-0.5 scale-95 opacity-0"
                }`}
              >
                  <ul className="space-y-1">
                    {catalogBodyTypeLinks.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="group/sub relative block overflow-hidden rounded-md px-2 py-1.5 text-sm text-slate-700 transition-all duration-300 ease-out before:absolute before:inset-y-0 before:left-0 before:w-0 before:rounded-md before:bg-gradient-to-r before:from-[color:var(--color-brand-accent)]/10 before:to-transparent before:transition-[width] before:duration-300 hover:before:w-full hover:text-[color:var(--color-brand-accent)] motion-reduce:before:transition-none"
                          onClick={() => setCatalogOpen(false)}
                        >
                          <span className="relative z-10">{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
              </div>
            </div>

            {desktopNav.slice(1).map((item) => {
              const active = navRouteActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${navMenuSurfaceClass(active)} rounded-lg`}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="relative z-10">{item.label}</span>
                  <span aria-hidden className={navMenuUnderlineClass(active)} />
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden min-w-[280px] items-center xl:flex xl:min-w-[290px]">
            <form
              onSubmit={(event) => submitSearch(event, desktopSearchValue)}
              className="flex w-full items-center gap-2"
            >
              <input
                type="search"
                value={desktopSearchValue}
                onChange={(event) => setDesktopSearchValue(event.target.value)}
                placeholder="Поиск по марке или модели"
                className={`min-w-0 flex-1 px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] ${headerControlChrome} ${headerControlRounded}`}
                aria-label="Поиск автомобилей"
              />
              <Button
                type="submit"
                variant="secondary"
                className={`!h-10 !min-h-10 !max-h-10 w-10 shrink-0 !p-0 ${headerControlRounded} shadow-[0_1px_2px_rgba(15,23,42,0.04)]`}
              >
                <Search className="h-4 w-4" aria-hidden />
              </Button>
            </form>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              type="button"
              aria-label={searchOpen ? "Скрыть поиск" : "Показать поиск"}
              onClick={() => setSearchOpen((prev) => !prev)}
              className={`${headerIconButtonClass} md:hidden`}
            >
              <Search className="h-5 w-5" aria-hidden />
            </button>

            <Link
              href="/compare"
              aria-label={`Сравнение, выбрано ${compareCount}`}
              className={headerIconButtonClass}
            >
              <Scale className="h-5 w-5" />
              {compareCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[color:var(--color-brand-accent)] px-1 text-[10px] font-semibold text-white">
                  {compareCountLabel}
                </span>
              ) : null}
            </Link>

            <Link
              href="/favorites"
              aria-label={`Избранное, выбрано ${wishlistCount}`}
              className={headerIconButtonClass}
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[color:var(--color-brand-accent)] px-1 text-[10px] font-semibold text-white">
                  {wishlistCountLabel}
                </span>
              ) : null}
            </Link>

            <a
              href={phoneHref}
              className={`inline-flex items-center gap-2 px-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 ${headerControlChrome} ${headerControlRounded}`}
            >
              <Phone className="h-4 w-4" />
              <span className="hidden whitespace-nowrap lg:inline">{contactSite.phoneDisplay}</span>
            </a>

            <Button
              type="button"
              className={`hidden min-h-0 px-4 text-sm md:inline-flex ${headerControlRounded} h-10 min-h-10 shadow-[0_1px_2px_rgba(15,23,42,0.04)]`}
              onClick={() => {
                setCallbackError("");
                setCallbackOpen(true);
              }}
            >
              Помочь с выбором?
            </Button>
          </div>
        </div>

        {searchOpen ? (
          <div className="border-t border-slate-200/90">
            <div className="container-wide py-2 md:py-3">
              <form onSubmit={(event) => submitSearch(event, mobileSearchValue)} className="flex gap-2 md:hidden">
                <input
                  type="search"
                  value={mobileSearchValue}
                  onChange={(event) => setMobileSearchValue(event.target.value)}
                  placeholder="Поиск по марке или модели"
                  className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)]"
                  aria-label="Поиск автомобилей"
                />
                <Button type="submit">Найти</Button>
              </form>
            </div>
          </div>
        ) : null}

        {mobileMenuOpen ? (
          <div className="border-t border-slate-200 bg-white md:hidden">
            <div className="container-wide py-3">
              <div className="mb-3 flex h-11 w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
                <MapPin className="h-4 w-4 shrink-0 text-[color:var(--color-brand-accent)]" aria-hidden />
                <button
                  type="button"
                  onClick={() => setCityModalOpen(true)}
                  disabled={cities.length === 0}
                  className="flex h-full min-h-0 min-w-0 flex-1 items-center justify-between gap-2 bg-transparent text-left text-sm outline-none transition hover:text-[color:var(--color-brand-accent)] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Выбрать город"
                  aria-haspopup="dialog"
                  aria-expanded={cityModalOpen}
                >
                  <span className="truncate">{cities.length === 0 ? "Загрузка…" : currentCityLabel}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
                </button>
              </div>
              <div className="space-y-2 rounded-xl border border-slate-200 p-3">
                <Link
                  href="/cars"
                  className={`block rounded-lg px-2 py-2 text-xs font-semibold uppercase tracking-wide transition-all duration-300 ${
                    catalogRouteActive
                      ? "bg-[color:var(--color-brand-accent)]/10 text-[color:var(--color-brand-accent)] ring-1 ring-[color:var(--color-brand-accent)]/35"
                      : "text-slate-500 hover:bg-slate-50 hover:text-[color:var(--color-brand-accent)]"
                  }`}
                  aria-current={catalogRouteActive ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Каталог
                </Link>
                <ul className="space-y-1.5">
                  {catalogBodyTypeLinks.map((item) => (
                    <li key={`mob-${item.href}`}>
                      <Link
                        href={item.href}
                        className="group/msub relative block overflow-hidden rounded-md px-2 py-2 text-sm font-medium text-slate-700 transition-all duration-300 before:absolute before:inset-y-0 before:left-0 before:w-0 before:rounded-md before:bg-gradient-to-r before:from-[color:var(--color-brand-accent)]/12 before:to-transparent before:transition-[width] before:duration-300 hover:before:w-full hover:text-[color:var(--color-brand-accent)] motion-reduce:before:transition-none"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="relative z-10">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <nav className="mt-3 grid grid-cols-2 gap-2">
                {desktopNav.slice(1).map((item) => {
                  const active = navRouteActive(pathname, item.href);
                  return (
                    <Link
                      key={`mob-nav-${item.href}`}
                      href={item.href}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${
                        active
                          ? "border-[color:var(--color-brand-accent)]/50 bg-[color:var(--color-brand-accent)]/10 text-[color:var(--color-brand-accent)] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-brand-accent)_28%,transparent)]"
                          : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <Button
                type="button"
                className="mt-3 w-full"
                onClick={() => {
                  setCallbackError("");
                  setCallbackOpen(true);
                }}
              >
                Заказать звонок
              </Button>
            </div>
          </div>
        ) : null}
      </header>

      <Modal
        open={callbackOpen}
        onClose={() => setCallbackOpen(false)}
        title="Заказать обратный звонок"
        description="Оставьте контакты, менеджер перезвонит в рабочее время."
      >
        <form onSubmit={submitCallback} className="space-y-4">
          <Input
            label="Ваше имя"
            value={callbackState.name}
            onChange={(event) => setCallbackState((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Например, Алексей"
            required
          />
          <Input
            label="Телефон"
            value={callbackState.phone}
            onChange={(event) => setCallbackState((prev) => ({ ...prev, phone: event.target.value }))}
            placeholder="+7 (___) ___-__-__"
            required
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={!canSubmitCallback || callbackSubmitting}>
              {callbackSubmitting ? "Отправка..." : "Отправить"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setCallbackOpen(false)}>
              Отмена
            </Button>
          </div>
          {callbackError ? <p className="text-sm text-rose-600">{callbackError}</p> : null}
        </form>
      </Modal>

      <Modal
        open={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        title="Выберите город"
        description="Сохраним выбор в браузере для персонализации каталога."
      >
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {cities.map((option) => {
            const selected = city === option.slug;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => applyCitySlug(option.slug)}
                className={`rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2 ${
                  selected
                    ? "border-[color:var(--color-brand-accent)] bg-[color:var(--color-brand-accent)]/[0.06] text-[color:var(--color-brand-accent)]"
                    : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                }`}
              >
                {option.name_imya}
              </button>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
