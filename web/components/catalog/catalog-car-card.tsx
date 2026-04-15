"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import { formatCurrency, formatMileage } from "@/lib/format";
import { getListingDerived } from "@/lib/car-listing-enrichment";
import { getResolvedCarImages } from "@/lib/car-images-map";
import { shouldUnoptimizeRemoteImage } from "@/lib/remote-image";
import { useWishlistStore } from "@/stores/wishlist-store";
import { Button } from "@/components/ui/button";
import type { Car } from "@/types/car";

const BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

function getGalleryImages(car: Car) {
  return getResolvedCarImages(car);
}

function resolvePassport(car: Car) {
  const ownersCount = car.ownersCount ?? car.passport.owners;
  const pts = car.pts ?? car.passport.ptsStatus;
  const hasAccident =
    typeof car.accident === "boolean" ? car.accident : car.passport.accident.has;
  return { ownersCount, pts, hasAccident };
}

function formatCountdown(remainingMs: number) {
  if (remainingMs <= 0) return "00:00:00";
  const s = Math.floor(remainingMs / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function useBookingCountdown(untilMs: number | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!untilMs) {
      return;
    }
    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    queueMicrotask(() => {
      setNow(Date.now());
    });
    return () => window.clearInterval(id);
  }, [untilMs]);

  if (!untilMs) {
    return 0;
  }
  return Math.max(0, untilMs - now);
}

const CARD_INTERACTIVE_SELECTOR =
  "a, button, input, select, textarea, label, [role='button'], [data-no-card-nav]";

export type CatalogCarCardProps = {
  car: Car;
  animationIndex: number;
  imagePriority?: boolean;
  showWishlistToggle?: boolean;
  compare?: {
    checked: boolean;
    disabled: boolean;
    onToggle: () => void;
  };
  isBooked: boolean;
  bookedUntilMs: number | null;
  isBookingSubmitting?: boolean;
  isCreditSubmitting?: boolean;
  onRequestBooking: (car: Car) => void;
  onRequestCredit: (car: Car) => void;
};

export function CatalogCarCard({
  car,
  animationIndex,
  imagePriority = false,
  showWishlistToggle = true,
  compare,
  isBooked,
  bookedUntilMs,
  isBookingSubmitting = false,
  isCreditSubmitting = false,
  onRequestBooking,
  onRequestCredit,
}: CatalogCarCardProps) {
  const router = useRouter();
  const wishlistIds = useWishlistStore((state) => state.ids);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const gallery = useMemo(() => getGalleryImages(car), [car]);
  const previewGallery = useMemo(() => gallery.slice(0, 5), [gallery]);
  const totalPhotos = gallery.length;
  const hiddenCount = Math.max(0, totalPhotos - previewGallery.length);
  const hasSlider = previewGallery.length > 1;
  const singleCoverUnoptimized = shouldUnoptimizeRemoteImage(previewGallery[0]);

  const [activeIndex, setActiveIndex] = useState(0);
  const hoverRafRef = useRef<number | null>(null);
  const hoverSegmentRef = useRef<number | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: false,
    align: "start",
    duration: 18,
  });

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setActiveIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi, previewGallery]);

  useEffect(() => {
    return () => {
      if (hoverRafRef.current) {
        window.cancelAnimationFrame(hoverRafRef.current);
      }
    };
  }, []);

  const onBarHover = (index: number) => {
    if (!emblaApi) return;
    if (hoverRafRef.current) {
      window.cancelAnimationFrame(hoverRafRef.current);
    }
    hoverRafRef.current = window.requestAnimationFrame(() => {
      emblaApi.scrollTo(index);
      hoverRafRef.current = null;
    });
  };

  const onHoverZoneMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!hasSlider || !emblaApi) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const segmentWidth = rect.width / previewGallery.length;
    const nextIndex = Math.min(
      previewGallery.length - 1,
      Math.max(0, Math.floor(x / segmentWidth)),
    );
    if (nextIndex !== hoverSegmentRef.current) {
      hoverSegmentRef.current = nextIndex;
      onBarHover(nextIndex);
    }
  };

  const onHoverZoneLeave = () => {
    hoverSegmentRef.current = null;
  };

  const onCardPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    suppressClickRef.current = false;
  };

  const onCardPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointerStartRef.current) return;
    const dx = Math.abs(event.clientX - pointerStartRef.current.x);
    const dy = Math.abs(event.clientY - pointerStartRef.current.y);
    if (dx > 8 || dy > 8) {
      suppressClickRef.current = true;
    }
  };

  const onCardPointerUp = () => {
    pointerStartRef.current = null;
  };

  const navigateToDetails = () => {
    router.push(`/cars/${car.id}`);
  };

  const shouldIgnoreCardClick = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return false;
    return target.closest(CARD_INTERACTIVE_SELECTOR) != null;
  };

  const onCardClick = (event: MouseEvent<HTMLElement>) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (shouldIgnoreCardClick(event.target)) {
      return;
    }
    navigateToDetails();
  };

  const onCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    if (shouldIgnoreCardClick(event.target)) {
      return;
    }
    event.preventDefault();
    navigateToDetails();
  };

  const derived = useMemo(() => getListingDerived(car), [car]);
  const passport = useMemo(() => resolvePassport(car), [car]);
  const hasVideo = Boolean(car.videoReviewUrl);
  const showDiscount = derived.oldPriceRub > car.priceRub;
  const discountRub = showDiscount ? derived.oldPriceRub - car.priceRub : 0;

  const ownersLabel = passport.ownersCount >= 3 ? "3+" : String(passport.ownersCount);
  const trustFacts = [
    passport.pts === "original" ? "Оригинал ПТС" : "Дубликат ПТС",
    passport.hasAccident ? "Есть ДТП" : "Без ДТП",
    `Владельцев: ${ownersLabel}`,
  ];

  const delayMs = Math.min(animationIndex, 12) * 45;
  const countdownMs = useBookingCountdown(isBooked ? bookedUntilMs : null);
  const expireSyncRef = useRef(false);

  useEffect(() => {
    expireSyncRef.current = false;
  }, [bookedUntilMs]);

  useEffect(() => {
    if (!isBooked || bookedUntilMs == null || countdownMs > 0) {
      return;
    }
    if (expireSyncRef.current) {
      return;
    }
    expireSyncRef.current = true;
    window.dispatchEvent(new CustomEvent("booked-cars-changed"));
  }, [isBooked, bookedUntilMs, countdownMs]);

  const hasApiMetrics = car.viewCount != null || car.bookingCount != null;
  const isWishlisted = wishlistIds.includes(car.id);

  return (
    <article
      className={`group/card relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[16px] border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(0,0,0,0.07)] transition-[transform,box-shadow,border-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:z-[1] hover:border-slate-300 hover:shadow-[0_16px_38px_rgba(0,0,0,0.14)] motion-safe:hover:-translate-y-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2 ${
        isBooked ? "opacity-55 grayscale-[0.35]" : ""
      } catalog-card-enter`}
      style={{ animationDelay: `${delayMs}ms` }}
      role="link"
      tabIndex={0}
      aria-label={`Открыть карточку автомобиля ${car.brand} ${car.model}, ${car.year}`}
      onClick={onCardClick}
      onKeyDown={onCardKeyDown}
    >
      <div
        className="relative aspect-[16/10] w-full cursor-pointer overflow-hidden bg-slate-100"
        onMouseMove={onHoverZoneMove}
        onMouseLeave={onHoverZoneLeave}
        onPointerDown={onCardPointerDown}
        onPointerMove={onCardPointerMove}
        onPointerUp={onCardPointerUp}
      >
        {hasSlider ? (
          <>
            {/* absolute inset-0: иначе h-full у Embla не получает высоту от aspect-ratio и fill-картинки с высотой 0 */}
            <div className="absolute inset-0 overflow-hidden" ref={emblaRef}>
              <div className="flex h-full">
                {previewGallery.map((imageSrc, index) => {
                  const imageUnoptimized = shouldUnoptimizeRemoteImage(imageSrc);
                  return (
                  <div
                    key={`${car.id}-catalog-img-${index}`}
                    className="relative h-full min-h-0 min-w-0 flex-[0_0_100%] shrink-0"
                  >
                    <Image
                      src={imageSrc}
                      alt={`${car.brand} ${car.model} — фото ${index + 1}`}
                      fill
                      unoptimized={imageUnoptimized}
                      className="cursor-pointer object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/card:scale-[1.035]"
                      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      placeholder={imageUnoptimized ? "empty" : "blur"}
                      blurDataURL={imageUnoptimized ? undefined : BLUR}
                      priority={imagePriority && index === 0}
                      loading={imagePriority && index === 0 ? "eager" : "lazy"}
                      draggable={false}
                    />
                    {hiddenCount > 0 && index === previewGallery.length - 1 ? (
                      <span
                        className="absolute inset-0 z-[1] flex items-center justify-center bg-black/45 text-sm font-semibold text-white"
                        aria-hidden
                      >
                        Еще {hiddenCount} фото
                      </span>
                    ) : null}
                  </div>
                  );
                })}
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-black/55 via-black/20 to-transparent px-2 pb-2 pt-5">
              <div className="flex items-center gap-1.5">
                {previewGallery.map((_, index) => (
                  <span
                    key={`${car.id}-slide-${index}`}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-150 ${
                      index === activeIndex ? "bg-white" : "bg-white/40"
                    }`}
                    aria-hidden
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0">
            <Image
              src={previewGallery[0]}
              alt={`${car.brand} ${car.model}, ${car.year}`}
              fill
              unoptimized={singleCoverUnoptimized}
              className="cursor-pointer object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/card:scale-[1.035]"
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
              placeholder={singleCoverUnoptimized ? "empty" : "blur"}
              blurDataURL={singleCoverUnoptimized ? undefined : BLUR}
              priority={imagePriority}
              loading={imagePriority ? "eager" : "lazy"}
              draggable={false}
            />
          </div>
        )}

        {compare ? (
          <label
            className="absolute left-2 top-2 z-[6] max-md:opacity-100 md:opacity-0 md:transition-opacity md:group-hover/card:opacity-100 md:group-focus-within/card:opacity-100 flex cursor-pointer select-none items-center gap-2 rounded-lg bg-black/55 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              className="h-3.5 w-3.5 shrink-0 rounded border-white/50 bg-white/10 text-[color:var(--color-brand-accent)] focus:ring-2 focus:ring-white/50"
              checked={compare.checked}
              disabled={compare.disabled}
              onChange={compare.onToggle}
              aria-label={`Добавить к сравнению: ${car.brand} ${car.model}`}
            />
            <span aria-hidden>Сравнить</span>
          </label>
        ) : null}

        {showWishlistToggle ? (
          <button
            type="button"
            data-no-card-nav
            className="absolute right-2 top-2 z-[7] inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/60 bg-white/90 text-[color:var(--color-brand-accent)] shadow-md backdrop-blur-sm transition hover:bg-white"
            onClick={(event) => {
              event.stopPropagation();
              toggleWishlist(car.id);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            aria-label={isWishlisted ? "Удалить из избранного" : "Добавить в избранное"}
            aria-pressed={isWishlisted}
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
        ) : null}

        {hasVideo ? (
          <span
            className="pointer-events-none absolute right-2 top-[3.35rem] z-[5] rounded-md bg-black/55 px-2 py-1 text-sm shadow-md backdrop-blur-sm"
            role="img"
            aria-label="Есть видеообзор этого автомобиля"
          >
            🎥
          </span>
        ) : null}

        <div className="pointer-events-none absolute left-2 top-12 z-[4] flex flex-col gap-1.5">
          {showDiscount ? (
            <span className="rounded-md bg-[color:var(--color-brand-accent-dark)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white shadow">
              Скидка −{formatCurrency(discountRub)}
            </span>
          ) : null}
        </div>

      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-4 pb-4 pt-3 md:px-5 md:pb-5">
        <Link
          href={`/cars/${car.id}`}
          className="text-base font-semibold text-[color:var(--color-brand-primary)] transition hover:text-[color:var(--color-brand-accent)] md:text-lg"
        >
          {car.brand} {car.model}, {car.year}
        </Link>

        <div className="space-y-1 border-b border-slate-100 pb-2">
          <p className="text-lg font-bold text-slate-900">{formatCurrency(car.priceRub)}</p>
          {showDiscount ? (
            <p className="text-xs text-slate-500 line-through">{formatCurrency(derived.oldPriceRub)}</p>
          ) : null}
          {hasApiMetrics ? (
            <p className="text-xs text-slate-600">
              {car.viewCount != null ? (
                <>
                  Просмотров: <span className="font-medium text-slate-800">{car.viewCount}</span>
                </>
              ) : null}
              {car.viewCount != null && car.bookingCount != null ? " · " : null}
              {car.bookingCount != null ? (
                <>
                  Забронирований:{" "}
                  <span className="font-medium text-slate-800">{car.bookingCount}</span>
                </>
              ) : null}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {trustFacts.slice(0, 2).map((fact) => (
            <span
              key={`${car.id}-${fact}`}
              className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700"
            >
              {fact}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span>
            {formatMileage(car.mileageKm)} км · {car.year}
          </span>
        </div>

        {!hasApiMetrics ? (
          <p className="text-xs text-slate-500">
            {derived.bookingCount > 0 ? (
              <>
                Забронировали {derived.bookingCount}{" "}
                {derived.bookingCount === 1 ? "раз" : "раза"} ·{" "}
              </>
            ) : null}
            {derived.viewCount} смотрят сейчас
          </p>
        ) : null}

        <div className="mt-auto flex flex-col gap-2 pt-1">
          <div className="grid grid-cols-1 gap-2 sm:[grid-template-columns:repeat(2,minmax(0,1fr))] sm:items-stretch">
            <Button
              type="button"
              className="box-border h-11 min-h-[44px] w-full min-w-0 px-3 text-[13px] font-semibold leading-tight sm:px-2 lg:px-3 lg:text-sm"
              disabled={isBooked || isBookingSubmitting}
              onClick={() => onRequestBooking(car)}
              aria-busy={isBookingSubmitting}
              aria-disabled={isBooked || isBookingSubmitting}
            >
              {isBookingSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                    aria-hidden
                  />
                  Отправка…
                </span>
              ) : isBooked ? (
                "Забронировано"
              ) : (
                "Забронировать"
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="box-border h-11 min-h-[44px] w-full min-w-0 px-3 text-[13px] font-semibold leading-tight sm:px-2 lg:px-3 lg:text-sm"
              disabled={isCreditSubmitting}
              onClick={() => onRequestCredit(car)}
            >
              {isCreditSubmitting ? "Отправка..." : "В кредит"}
            </Button>
          </div>
          {isBooked && bookedUntilMs != null && countdownMs > 0 ? (
            <p
              className="text-xs font-medium text-slate-700 tabular-nums"
              aria-live="polite"
              title="Осталось до снятия метки брони на этом устройстве"
            >
              Повторно через: {formatCountdown(countdownMs)}
            </p>
          ) : null}
          {isBooked ? (
            <p className="text-xs text-slate-600" aria-live="polite">
              Заявка на бронь отправлена с этого устройства (24 ч).
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
