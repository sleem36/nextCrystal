import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Heart } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { driveLabel, fuelLabel, transmissionLabel } from "@/lib/car-labels";
import { formatCurrency, formatMileage } from "@/lib/format";
import { useWishlistStore } from "@/stores/wishlist-store";
import { getResolvedCarImages } from "@/lib/car-images-map";
import { Car } from "@/types/car";

const btnPrimaryClass =
  "inline-flex h-11 flex-1 items-center justify-center rounded-[var(--radius-button,0.5rem)] bg-[color:var(--color-brand-accent)] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,118,234,0.35)] transition-colors duration-150 ease-out hover:bg-[color:var(--color-brand-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2 text-center";
const btnSecondaryClass =
  "inline-flex h-11 flex-1 items-center justify-center rounded-[var(--radius-button,0.5rem)] border border-slate-300 bg-white px-5 text-sm font-semibold text-[color:var(--color-brand-primary)] transition-colors duration-150 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-primary)] focus-visible:ring-offset-2 text-center";

type CarCardProps = {
  car: Car;
  /** На главной: открыть заявку. В каталоге не используется. */
  onSelect?: (car: Car) => void;
  /** Ссылки на /cars/[id] вместо модалки главной */
  catalog?: boolean;
  /** Чекбокс сравнения (листинг каталога) */
  compare?: {
    checked: boolean;
    disabled: boolean;
    onToggle: () => void;
  };
};

function getGalleryImages(car: Car) {
  return getResolvedCarImages(car);
}

export function CarCard({ car, onSelect, catalog = false, compare }: CarCardProps) {
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isWishlisted = useWishlistStore((state) => state.has(car.id));
  const quickFacts = car.trustPoints.slice(0, 2);
  const gallery = useMemo(() => getGalleryImages(car), [car]);
  const previewGallery = useMemo(() => gallery.slice(0, 5), [gallery]);
  const totalPhotos = gallery.length;
  const hiddenCount = Math.max(0, totalPhotos - previewGallery.length);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const hoverRafRef = useRef<number | null>(null);
  const hoverSegmentRef = useRef<number | null>(null);
  const scrollYRef = useRef(0);
  const hasSlider = previewGallery.length > 1;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: false,
    align: "start",
    duration: 18,
  });
  const [lightboxEmblaRef, lightboxEmblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: false,
    align: "start",
    duration: 20,
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
    return () => {
      if (hoverRafRef.current) {
        window.cancelAnimationFrame(hoverRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!lightboxEmblaApi) return;
    const onSelect = () => setLightboxIndex(lightboxEmblaApi.selectedScrollSnap());
    onSelect();
    lightboxEmblaApi.on("select", onSelect);
    lightboxEmblaApi.on("reInit", onSelect);
    return () => {
      lightboxEmblaApi.off("select", onSelect);
      lightboxEmblaApi.off("reInit", onSelect);
    };
  }, [lightboxEmblaApi]);

  useEffect(() => {
    if (!lightboxOpen) return;
    scrollYRef.current = window.scrollY;
    const body = document.body;
    const prevPosition = body.style.position;
    const prevTop = body.style.top;
    const prevWidth = body.style.width;
    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.width = "100%";
    return () => {
      body.style.position = prevPosition;
      body.style.top = prevTop;
      body.style.width = prevWidth;
      window.scrollTo(0, scrollYRef.current);
    };
  }, [lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen || !lightboxEmblaApi) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      } else if (event.key === "ArrowLeft") {
        lightboxEmblaApi.scrollPrev();
      } else if (event.key === "ArrowRight") {
        lightboxEmblaApi.scrollNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, lightboxEmblaApi]);

  const openLightbox = (index: number) => {
    setLightboxOpen(true);
    setLightboxIndex(index);
    window.requestAnimationFrame(() => {
      lightboxEmblaApi?.scrollTo(index);
    });
  };

  const lightboxPrev = () => {
    lightboxEmblaApi?.scrollPrev();
  };

  const lightboxNext = () => {
    lightboxEmblaApi?.scrollNext();
  };

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
    const nextIndex = Math.min(previewGallery.length - 1, Math.max(0, Math.floor(x / segmentWidth)));
    if (nextIndex !== hoverSegmentRef.current) {
      hoverSegmentRef.current = nextIndex;
      onBarHover(nextIndex);
    }
  };

  const onHoverZoneLeave = () => {
    hoverSegmentRef.current = null;
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden p-0 md:p-0">
      <div
        className="group relative aspect-[16/10] w-full overflow-hidden bg-slate-100"
        onMouseMove={onHoverZoneMove}
        onMouseLeave={onHoverZoneLeave}
      >
        <button
          type="button"
          className="absolute right-2 top-2 z-[8] inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/60 bg-white/90 text-[color:var(--color-brand-accent)] shadow-md backdrop-blur-sm transition hover:bg-white"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleWishlist(car.id);
          }}
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          aria-label={isWishlisted ? "Удалить из избранного" : "Добавить в избранное"}
          aria-pressed={isWishlisted}
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
        </button>
        {compare ? (
          <label
            className="absolute left-2 top-2 z-[6] flex cursor-pointer select-none items-center gap-2 rounded-md bg-black/50 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur-[2px]"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              className="h-3.5 w-3.5 shrink-0 rounded border-white/50 bg-white/10 text-[color:var(--color-brand-accent)] focus:ring-2 focus:ring-white/50"
              checked={compare.checked}
              disabled={compare.disabled}
              onChange={compare.onToggle}
              aria-label="Сравнить"
            />
            Сравнить
          </label>
        ) : null}
        {hasSlider ? (
          <>
            <div className="h-full overflow-hidden" ref={emblaRef}>
              <div className="flex h-full">
                {previewGallery.map((src, index) => (
                  <div key={`${car.id}-img-${index}`} className="relative min-w-0 flex-[0_0_100%]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`${car.brand} ${car.model} — фото ${index + 1}`}
                      className="h-full w-full object-cover object-center"
                      width={960}
                      height={600}
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      fetchPriority="auto"
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      onClick={() => openLightbox(index)}
                    />
                    {hiddenCount > 0 && index === previewGallery.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => openLightbox(index)}
                        className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white"
                      >
                        Еще {hiddenCount} фото
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-black/55 via-black/20 to-transparent px-2 pb-2 pt-5">
              <div className="flex items-center gap-1.5">
                {previewGallery.map((_, index) => (
                  <span
                    key={`${car.id}-slide-${index}`}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-150 ${
                      index === activeIndex ? "bg-white" : "bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewGallery[0]}
            alt={`${car.brand} ${car.model}`}
            className="h-full w-full object-cover object-center"
            width={960}
            height={600}
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            fetchPriority="auto"
            loading="lazy"
            decoding="async"
            draggable={false}
            onClick={() => openLightbox(0)}
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-1 md:px-6 md:pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[color:var(--color-brand-primary)]">
          {car.brand} {car.model}, {car.year}
        </h3>
      </div>
      <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
        <p>
          <span className="block text-xs text-slate-500">Пробег</span>
          <span className="font-semibold text-slate-900">{formatMileage(car.mileageKm)} км</span>
        </p>
        <p>
          <span className="block text-xs text-slate-500">Цена</span>
          <span className="font-semibold text-slate-900">{formatCurrency(car.priceRub)}</span>
        </p>
        <p>
          <span className="block text-xs text-slate-500">Платеж/мес</span>
          <span className="font-semibold text-slate-900">
            {formatCurrency(car.monthlyPaymentRub)}
          </span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-slate-600">
        {quickFacts.map((item) => (
          <span key={item} className="rounded-md bg-slate-100 px-2 py-1">
            {item}
          </span>
        ))}
      </div>
      <p className="text-xs text-slate-500">
        {transmissionLabel(car.transmission)} · {driveLabel(car.drive)} · {fuelLabel(car.fuel)} ·{" "}
        {car.color}
      </p>
      <div className="mt-auto flex gap-2 pt-1">
        {catalog ? (
          <>
            <Link href={`/cars/${car.id}`} className={btnPrimaryClass}>
              Смотреть авто
            </Link>
            <Link href={`/cars/${car.id}#lead-form`} className={btnSecondaryClass}>
              Заявка
            </Link>
          </>
        ) : (
          <>
            <Button className="flex-1" onClick={() => onSelect?.(car)}>
              Получить расчет
            </Button>
            <Link href={`/cars/${car.id}`} className={btnSecondaryClass}>
              Подробнее
            </Link>
          </>
        )}
      </div>
      </div>
      {lightboxOpen ? (
        <div className="fixed inset-0 z-[90] bg-black/95">
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-3 top-3 z-[2] rounded-md bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
          >
            Закрыть
          </button>
          <div className="absolute left-3 top-3 z-[2] rounded-md bg-white/10 px-2 py-1 text-xs text-white">
            {lightboxIndex + 1}/{gallery.length}
          </div>
          <button
            type="button"
            onClick={lightboxPrev}
            className="absolute left-3 top-1/2 z-[2] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25 md:inline-flex"
            aria-label="Предыдущее фото"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={lightboxNext}
            className="absolute right-3 top-1/2 z-[2] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25 md:inline-flex"
            aria-label="Следующее фото"
          >
            ›
          </button>
          <div className="h-full overflow-hidden" ref={lightboxEmblaRef}>
            <div className="flex h-full">
              {gallery.map((src, index) => (
                <div key={`${car.id}-full-${index}`} className="min-w-0 flex-[0_0_100%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${car.brand} ${car.model} — галерея ${index + 1}`}
                    className="h-full w-full object-contain"
                    width={1600}
                    height={1000}
                    sizes="100vw"
                    loading={Math.abs(index - lightboxIndex) <= 1 ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>
          {gallery.length > 1 ? (
            <div className="absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-black/85 via-black/60 to-transparent px-3 pb-3 pt-8">
              <div className="mx-auto flex max-w-4xl gap-2 overflow-x-auto pb-1">
                {gallery.map((src, index) => (
                  <button
                    key={`${car.id}-thumb-${index}`}
                    type="button"
                    onClick={() => lightboxEmblaApi?.scrollTo(index)}
                    className={`relative h-14 w-24 shrink-0 overflow-hidden rounded-md border ${
                      index === lightboxIndex ? "border-white" : "border-white/30"
                    }`}
                    aria-label={`Открыть фото ${index + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                      width={96}
                      height={56}
                      sizes="96px"
                      loading={Math.abs(index - lightboxIndex) <= 1 ? "eager" : "lazy"}
                      decoding="async"
                      draggable={false}
                    />
                    {index === lightboxIndex ? (
                      <span className="absolute inset-0 border-2 border-white" aria-hidden />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
