"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Heart, Scale } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCompareSelection } from "@/hooks/use-compare-selection";
import { IMAGE_BLUR_DATA_URL } from "@/lib/image-blur-placeholder";
import { shouldUnoptimizeRemoteImage } from "@/lib/remote-image";
import { useWishlistStore } from "@/stores/wishlist-store";

type VehicleGalleryProps = {
  images: string[];
  brand: string;
  model: string;
  year: number;
  className?: string;
  wishlistCarId?: string;
};

export function VehicleGallery({
  images,
  brand,
  model,
  year,
  className = "",
  wishlistCarId,
}: VehicleGalleryProps) {
  const { compareIds, toggle } = useCompareSelection();
  const wishlistIds = useWishlistStore((state) => state.ids);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const title = `${brand} ${model}, ${year}`;
  const gallery = useMemo(() => images, [images]);
  const MAX_VISIBLE_GALLERY = 5;
  const MAX_THUMB_SLOTS = 5;
  const previewGallery = useMemo(() => gallery.slice(0, MAX_VISIBLE_GALLERY), [gallery]);
  const totalPhotos = gallery.length;
  const hiddenCount = Math.max(0, totalPhotos - previewGallery.length);
  const thumbPreviewLimit = hiddenCount > 0 ? MAX_THUMB_SLOTS - 1 : MAX_THUMB_SLOTS;
  const thumbPreview = previewGallery.slice(0, thumbPreviewLimit);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const scrollYRef = useRef(0);
  const hoverRafRef = useRef<number | null>(null);
  const hoverSegmentRef = useRef<number | null>(null);
  const hasSlider = previewGallery.length > 1;
  const firstGallerySrc = previewGallery[0];
  const firstGalleryUnoptimized = firstGallerySrc ? shouldUnoptimizeRemoteImage(firstGallerySrc) : false;
  const compareChecked = Boolean(wishlistCarId && compareIds.includes(wishlistCarId));
  const compareDisabled = Boolean(wishlistCarId && !compareChecked && compareIds.length >= 3);
  const isWishlisted = Boolean(wishlistCarId && wishlistIds.includes(wishlistCarId));
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
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi, previewGallery]);

  const safeActiveIndex = Math.min(activeIndex, Math.max(0, previewGallery.length - 1));

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

  if (!previewGallery.length) {
    return (
      <div className="aspect-[16/10] w-full bg-slate-100 text-sm text-slate-500 flex items-center justify-center rounded-[var(--radius-card)] border border-slate-200">
        Фото скоро появятся
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-2 lg:space-y-2 ${className}`}>
        <div
          className="relative mx-auto aspect-[752/500] w-full max-w-[752px] overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-slate-100"
          onMouseMove={onHoverZoneMove}
          onMouseLeave={onHoverZoneLeave}
        >
          {wishlistCarId ? (
            <>
              <button
                type="button"
                className={`absolute right-14 top-2 z-[7] inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/60 bg-white/90 text-[color:var(--color-brand-accent)] shadow-md backdrop-blur-sm transition hover:bg-white ${
                  compareDisabled ? "cursor-not-allowed opacity-50" : ""
                }`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (!compareDisabled) {
                    toggle(wishlistCarId);
                  }
                }}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                aria-label={compareChecked ? "Убрать из сравнения" : "Добавить в сравнение"}
                aria-pressed={compareChecked}
                disabled={compareDisabled}
                title={compareDisabled ? "Можно выбрать максимум 3 автомобиля" : "Добавить в сравнение"}
              >
                <Scale className={`h-5 w-5 ${compareChecked ? "fill-current" : ""}`} />
              </button>
              <button
                type="button"
                className="absolute right-2 top-2 z-[7] inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/60 bg-white/90 text-[color:var(--color-brand-accent)] shadow-md backdrop-blur-sm transition hover:bg-white"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  toggleWishlist(wishlistCarId);
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
            </>
          ) : null}
          {hasSlider ? (
            <>
              <div className="absolute inset-0 overflow-hidden" ref={emblaRef}>
                <div className="flex h-full">
                  {previewGallery.map((src, index) => {
                    const imageUnoptimized = shouldUnoptimizeRemoteImage(src);
                    return (
                      <div
                        key={`img-${index}`}
                        className="relative h-full min-h-0 min-w-0 flex-[0_0_100%] shrink-0"
                      >
                        <Image
                          src={src}
                          alt={`${title} — фото ${index + 1}`}
                          fill
                          unoptimized={imageUnoptimized}
                          className="cursor-zoom-in object-cover object-center"
                          sizes="(max-width: 768px) 100vw, 752px"
                          placeholder={imageUnoptimized ? "empty" : "blur"}
                          blurDataURL={imageUnoptimized ? undefined : IMAGE_BLUR_DATA_URL}
                          priority={index === 0}
                          loading={index === 0 ? "eager" : "lazy"}
                          draggable={false}
                          onClick={() => openLightbox(index)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-black/55 via-black/20 to-transparent px-2 pb-2 pt-5">
                <div className="flex items-center gap-1.5">
                  {previewGallery.map((_, index) => (
                    <span
                      key={`slide-dot-${index}`}
                      className={`h-1.5 flex-1 rounded-full transition-colors duration-150 ${
                        index === safeActiveIndex ? "bg-white" : "bg-white/40"
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
                alt={title}
                fill
                unoptimized={firstGalleryUnoptimized}
                className="cursor-zoom-in object-cover object-center"
                sizes="(max-width: 768px) 100vw, 752px"
                placeholder={firstGalleryUnoptimized ? "empty" : "blur"}
                blurDataURL={firstGalleryUnoptimized ? undefined : IMAGE_BLUR_DATA_URL}
                priority
                loading="eager"
                draggable={false}
                onClick={() => openLightbox(0)}
              />
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-1.5 pb-1">
            {thumbPreview.map((src, index) => (
              <button
                key={`thumb-preview-${index}`}
                type="button"
                onClick={() => {
                  emblaApi?.scrollTo(index);
                  setActiveIndex(index);
                }}
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md border transition ${
                  safeActiveIndex === index
                    ? "border-[color:var(--color-brand-accent)]"
                    : "border-slate-300 hover:border-slate-400"
                }`}
                aria-label={`Показать фото ${index + 1}`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  unoptimized={shouldUnoptimizeRemoteImage(src)}
                  className="object-cover"
                  sizes="80px"
                  loading="lazy"
                  draggable={false}
                />
              </button>
            ))}
            {hiddenCount > 0 ? (
              <button
                type="button"
                onClick={() => openLightbox(safeActiveIndex)}
                className="group relative inline-flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-300"
                aria-label={`Показать все фото (${gallery.length})`}
              >
                {/* Фон как у соседних превью: последний видимый кадр + затемнение */}
                <Image
                  src={previewGallery[previewGallery.length - 1]}
                  alt=""
                  fill
                  unoptimized={shouldUnoptimizeRemoteImage(previewGallery[previewGallery.length - 1])}
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  sizes="80px"
                  loading="lazy"
                  draggable={false}
                />
                <span className="absolute inset-0 bg-black/45" aria-hidden />
                <span className="relative z-[1] text-center text-sm font-semibold leading-tight text-white">
                  Показать все
                  <br />
                  <span className="text-xs font-medium text-white/90">+{hiddenCount}</span>
                </span>
              </button>
            ) : null}
          </div>
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
                <div key={`full-${index}`} className="relative min-w-0 flex-[0_0_100%]">
                  <Image
                    src={src}
                    alt={`${title} — галерея ${index + 1}`}
                    fill
                    unoptimized={shouldUnoptimizeRemoteImage(src)}
                    className="object-contain"
                    sizes="100vw"
                    loading={Math.abs(index - lightboxIndex) <= 1 ? "eager" : "lazy"}
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
                    key={`thumb-${index}`}
                    type="button"
                    onClick={() => lightboxEmblaApi?.scrollTo(index)}
                    className={`relative h-14 w-24 shrink-0 overflow-hidden rounded-md border ${
                      index === lightboxIndex ? "border-white" : "border-white/30"
                    }`}
                    aria-label={`Открыть фото ${index + 1}`}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      unoptimized={shouldUnoptimizeRemoteImage(src)}
                      className="object-cover"
                      sizes="96px"
                      loading={Math.abs(index - lightboxIndex) <= 1 ? "eager" : "lazy"}
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
    </>
  );
}
