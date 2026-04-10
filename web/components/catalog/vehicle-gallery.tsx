"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

type VehicleGalleryProps = {
  images: string[];
  brand: string;
  model: string;
  year: number;
  className?: string;
};

export function VehicleGallery({ images, brand, model, year, className = "" }: VehicleGalleryProps) {
  const title = `${brand} ${model}, ${year}`;
  const gallery = useMemo(() => images, [images]);
  const previewGallery = useMemo(() => gallery.slice(0, 5), [gallery]);
  const totalPhotos = gallery.length;
  const hiddenCount = Math.max(0, totalPhotos - previewGallery.length);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const scrollYRef = useRef(0);
  const hasSlider = gallery.length > 1;
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

  if (!previewGallery.length) {
    return (
      <div className="aspect-[16/10] w-full bg-slate-100 text-sm text-slate-500 flex items-center justify-center rounded-[var(--radius-card)] border border-slate-200">
        Фото скоро появятся
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-2 lg:grid lg:h-full lg:grid-rows-[minmax(0,1fr)_5rem] lg:gap-2 lg:space-y-0 ${className}`}>
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-slate-100 lg:aspect-auto lg:h-full">
          {hasSlider ? (
            <div className="h-full overflow-hidden" ref={emblaRef}>
              <div className="flex h-full">
                {gallery.map((src, index) => (
                  <div key={`img-${index}`} className="relative min-w-0 flex-[0_0_100%]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`${title} — фото ${index + 1}`}
                      className="h-full w-full cursor-zoom-in object-cover object-center"
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                      draggable={false}
                      onClick={() => openLightbox(index)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewGallery[0]}
              alt={title}
              className="h-full w-full cursor-zoom-in object-cover object-center"
              loading="eager"
              decoding="async"
              draggable={false}
              onClick={() => openLightbox(0)}
            />
          )}
        </div>
        <div className="overflow-x-auto lg:h-20">
          <div className="flex min-w-max gap-1.5 lg:h-full">
            {previewGallery.map((src, index) => (
              <button
                key={`thumb-preview-${index}`}
                type="button"
                onClick={() => {
                  emblaApi?.scrollTo(index);
                  setActiveIndex(index);
                }}
                className={`relative h-20 w-32 shrink-0 overflow-hidden rounded-md border transition lg:h-full ${
                  activeIndex === index
                    ? "border-[color:var(--color-brand-accent)]"
                    : "border-slate-300 hover:border-slate-400"
                }`}
                aria-label={`Показать фото ${index + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
                {hiddenCount > 0 && index === previewGallery.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center bg-black/50 text-base font-semibold text-white"
                  >
                    Показать все
                  </span>
                ) : null}
              </button>
            ))}
            {hiddenCount > 0 ? (
              <button
                type="button"
                onClick={() => openLightbox(activeIndex)}
                className="inline-flex h-20 w-32 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Показать все
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
                <div key={`full-${index}`} className="min-w-0 flex-[0_0_100%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${title} — галерея ${index + 1}`}
                    className="h-full w-full object-contain"
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
                    key={`thumb-${index}`}
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
    </>
  );
}
