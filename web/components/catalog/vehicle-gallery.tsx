"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

type VehicleGalleryProps = {
  images: string[];
  brand: string;
  model: string;
  year: number;
};

export function VehicleGallery({ images, brand, model, year }: VehicleGalleryProps) {
  const title = `${brand} ${model}, ${year}`;
  const gallery = useMemo(() => images, [images]);
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

  const onHoverZoneMove = (event: React.MouseEvent<HTMLDivElement>) => {
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

  if (!previewGallery.length) {
    return (
      <div className="aspect-[16/10] w-full bg-slate-100 text-sm text-slate-500 flex items-center justify-center rounded-[var(--radius-card)] border border-slate-200">
        Фото скоро появятся
      </div>
    );
  }

  return (
    <>
      <div
        className="group relative aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-slate-100"
        onMouseMove={onHoverZoneMove}
        onMouseLeave={onHoverZoneLeave}
      >
        {hasSlider ? (
          <>
            <div className="h-full overflow-hidden" ref={emblaRef}>
              <div className="flex h-full">
                {previewGallery.map((src, index) => (
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
                    key={`slide-${index}`}
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
            alt={title}
            className="h-full w-full cursor-zoom-in object-cover object-center"
            loading="eager"
            decoding="async"
            draggable={false}
            onClick={() => openLightbox(0)}
          />
        )}
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
