"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ChevronDown, Heart, MapPin, Menu, Phone, Scale, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useCompareSelection } from "@/hooks/use-compare-selection";
import { METRIKA_GOALS, trackGoal } from "@/lib/analytics";
import { contactSite, telHref } from "@/lib/contact-site";
import { useWishlistStore } from "@/stores/wishlist-store";

const desktopNav = [
  { href: "/cars", label: "Каталог" },
  { href: "/about", label: "О компании" },
  { href: "/contacts", label: "Контакты" },
];

const catalogGroups = [
  {
    title: "Тип кузова",
    links: [
      { href: "/cars", label: "Все автомобили" },
      { href: "/cars?bodyType=suv", label: "Кроссоверы и SUV" },
      { href: "/cars?bodyType=sedan", label: "Седаны" },
      { href: "/cars?bodyType=hatchback", label: "Хэтчбеки" },
      { href: "/cars?bodyType=liftback", label: "Лифтбеки" },
    ],
  },
];

const CITY_STORAGE_KEY = "selected_city";
const cityOptions = ["Москва", "Барнаул", "Новосибирск", "Екатеринбург", "Казань", "Краснодар"];

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
  const [city, setCity] = useState("Москва");
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [callbackState, setCallbackState] = useState<CallbackFormState>({ name: "", phone: "" });
  const [callbackSubmitting, setCallbackSubmitting] = useState(false);
  const [callbackError, setCallbackError] = useState("");

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
    const timer = window.setTimeout(() => {
      const storedCity = window.localStorage.getItem(CITY_STORAGE_KEY);
      if (storedCity) {
        setCity(storedCity);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

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

  const selectCity = (nextCity: string) => {
    setCity(nextCity);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CITY_STORAGE_KEY, nextCity);
    }
    setCityModalOpen(false);
  };

  const iconButtonClass =
    "relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-50";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/90 shadow-[0_2px_10px_rgba(15,23,42,0.04)] backdrop-blur-md">
        <div className="container-wide flex h-[60px] items-center gap-2 md:h-[74px] md:gap-4">
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-50 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>

          <Link href="/" className="min-w-0 shrink-0">
            <span className="block truncate text-base font-bold tracking-tight text-[color:var(--color-brand-primary)] md:text-lg">
              Crystal Motors
            </span>
            <span className="hidden text-[11px] font-medium uppercase tracking-wide text-slate-500 md:block">
              Автомобили с пробегом
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setCityModalOpen(true)}
            className="hidden items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 md:inline-flex"
            aria-label="Выбрать город"
          >
            <MapPin className="h-4 w-4 text-[color:var(--color-brand-accent)]" />
            <span>{city}</span>
          </button>

          <nav className="relative hidden items-center gap-5 text-sm lg:flex">
            <div
              className="relative"
              onMouseEnter={() => setCatalogOpen(true)}
              onMouseLeave={() => setCatalogOpen(false)}
            >
              <button
                type="button"
                className="inline-flex items-center gap-1 font-medium text-slate-700 transition hover:text-[color:var(--color-brand-accent)]"
                aria-expanded={catalogOpen}
                aria-label="Открыть категории каталога"
                onClick={() => setCatalogOpen((prev) => !prev)}
              >
                Каталог
                <ChevronDown className="h-4 w-4" aria-hidden />
              </button>
              <div
                className={`absolute left-0 top-full z-50 mt-2 w-72 origin-top rounded-xl border border-slate-200 bg-white p-3 shadow-xl transition duration-150 ${
                  catalogOpen
                    ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none -translate-y-1 scale-95 opacity-0"
                }`}
              >
                  {catalogGroups.map((group) => (
                    <div key={group.title}>
                      <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {group.title}
                      </p>
                      <ul className="space-y-1">
                        {group.links.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className="block rounded-md px-2 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-[color:var(--color-brand-accent)]"
                              onClick={() => setCatalogOpen(false)}
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>

            {desktopNav.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-medium text-slate-700 underline-offset-4 transition hover:text-[color:var(--color-brand-accent)] hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden min-w-[280px] items-center md:flex lg:min-w-[340px]">
            <form onSubmit={(event) => submitSearch(event, desktopSearchValue)} className="flex w-full gap-2">
              <input
                type="search"
                value={desktopSearchValue}
                onChange={(event) => setDesktopSearchValue(event.target.value)}
                placeholder="Поиск по марке или модели"
                className="h-10 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)]"
                aria-label="Поиск автомобилей"
              />
              <Button type="submit" variant="secondary" className="h-10 px-3">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              type="button"
              aria-label={searchOpen ? "Скрыть поиск" : "Показать поиск"}
              onClick={() => setSearchOpen((prev) => !prev)}
              className={`${iconButtonClass} md:hidden`}
            >
              <Search className="h-5 w-5" aria-hidden />
            </button>

            <Link
              href="/compare"
              aria-label={`Сравнение, выбрано ${compareCount}`}
              className={iconButtonClass}
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
              className={iconButtonClass}
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
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden lg:inline">{contactSite.phoneDisplay}</span>
            </a>

            <Button
              type="button"
              className="hidden md:inline-flex"
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
              <button
                type="button"
                onClick={() => setCityModalOpen(true)}
                className="mb-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
              >
                <MapPin className="h-4 w-4 text-[color:var(--color-brand-accent)]" />
                {city}
              </button>
              <div className="space-y-2 rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Каталог</p>
                <ul className="space-y-1.5">
                  {catalogGroups[0].links.map((item) => (
                    <li key={`mob-${item.href}`}>
                      <Link
                        href={item.href}
                        className="block rounded-md px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <nav className="mt-3 grid grid-cols-2 gap-2">
                {desktopNav.slice(1).map((item) => (
                  <Link
                    key={`mob-nav-${item.href}`}
                    href={item.href}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
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
        <div className="grid gap-2 sm:grid-cols-2">
          {cityOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => selectCity(option)}
              className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${
                city === option
                  ? "border-[color:var(--color-brand-accent)] bg-red-50 text-[color:var(--color-brand-accent)]"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
