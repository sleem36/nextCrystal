"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { IMAGE_BLUR_DATA_URL } from "@/lib/image-blur-placeholder";
import { shouldUnoptimizeRemoteImage } from "@/lib/remote-image";

const CONTACT_GALLERY_FALLBACK_SRC = "/images/cars/placeholder.svg";

type ContactBranchGalleryProps = {
  images: string[];
  cityLabel: string;
};

/**
 * Тот же паттерн слайдера, что в карточке каталога (`CatalogCarCard`): Embla, наведение по зонам, полоски снизу.
 */
export function ContactBranchGallery({ images, cityLabel }: ContactBranchGalleryProps) {
  const gallery = useMemo(() => images, [images]);
  const previewGallery = useMemo(() => gallery.slice(0, 5), [gallery]);
  const hasSlider = previewGallery.length > 1;

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [failedPreviewIndexes, setFailedPreviewIndexes] = useState<Set<number>>(() => new Set());
  const [failedGalleryIndexes, setFailedGalleryIndexes] = useState<Set<number>>(() => new Set());
  const scrollYRef = useRef(0);
  const hoverRafRef = useRef<number | null>(null);
  const hoverSegmentRef = useRef<number | null>(null);

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

  useEffect(() => {
    setFailedPreviewIndexes(new Set());
    setFailedGalleryIndexes(new Set());
  }, [gallery, previewGallery]);

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

  if (previewGallery.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[color:var(--border-soft)] bg-[color:var(--surface-card-muted)] text-sm text-[color:var(--text-soft)]">
        Фото салона появятся после загрузки съёмки
      </div>
    );
  }

  const singleCoverUnoptimized = shouldUnoptimizeRemoteImage(previewGallery[0]);

  return (
    <div
      className="relative aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--border-soft)] bg-[color:var(--surface-card-muted)]"
      onMouseMove={onHoverZoneMove}
      onMouseLeave={onHoverZoneLeave}
    >
      {hasSlider ? (
        <>
          <div className="absolute inset-0 overflow-hidden" ref={emblaRef}>
            <div className="flex h-full">
              {previewGallery.map((imageSrc, index) => {
                const displaySrc = failedPreviewIndexes.has(index) ? CONTACT_GALLERY_FALLBACK_SRC : imageSrc;
                const imageUnoptimized = shouldUnoptimizeRemoteImage(displaySrc);
                return (
                  <div
                    key={`contact-gallery-${imageSrc}-${index}`}
                    className="relative h-full min-h-0 min-w-0 flex-[0_0_100%] shrink-0"
                  >
                    <Image
                      src={displaySrc}
                      alt={`${cityLabel} — фото салона ${index + 1}`}
                      fill
                      unoptimized={imageUnoptimized}
                      className="cursor-zoom-in object-cover object-center"
                      sizes="(min-width: 1024px) 42vw, 100vw"
                      placeholder={imageUnoptimized ? "empty" : "blur"}
                      blurDataURL={imageUnoptimized ? undefined : IMAGE_BLUR_DATA_URL}
                      priority={index === 0}
                      loading={index === 0 ? "eager" : "lazy"}
                      draggable={false}
                      onError={() => {
                        if (displaySrc === CONTACT_GALLERY_FALLBACK_SRC) return;
                        setFailedPreviewIndexes((prev) => {
                          if (prev.has(index)) return prev;
                          const next = new Set(prev);
                          next.add(index);
                          return next;
                        });
                      }}
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
                  key={`contact-slide-${index}`}
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
          {(() => {
            const displaySrc = failedPreviewIndexes.has(0) ? CONTACT_GALLERY_FALLBACK_SRC : previewGallery[0];
            return (
          <Image
            src={displaySrc}
            alt={`${cityLabel}, салон`}
            fill
            unoptimized={singleCoverUnoptimized}
            className="cursor-zoom-in object-cover object-center"
            sizes="(min-width: 1024px) 42vw, 100vw"
            placeholder={singleCoverUnoptimized ? "empty" : "blur"}
            blurDataURL={singleCoverUnoptimized ? undefined : IMAGE_BLUR_DATA_URL}
            priority
            loading="eager"
            draggable={false}
            onError={() => {
              if (displaySrc === CONTACT_GALLERY_FALLBACK_SRC) return;
              setFailedPreviewIndexes((prev) => {
                if (prev.has(0)) return prev;
                const next = new Set(prev);
                next.add(0);
                return next;
              });
            }}
            onClick={() => openLightbox(0)}
          />
            );
          })()}
        </div>
      )}

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
            onClick={() => lightboxEmblaApi?.scrollPrev()}
            className="absolute left-3 top-1/2 z-[2] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25 md:inline-flex"
            aria-label="Предыдущее фото"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => lightboxEmblaApi?.scrollNext()}
            className="absolute right-3 top-1/2 z-[2] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25 md:inline-flex"
            aria-label="Следующее фото"
          >
            ›
          </button>
          <div className="h-full overflow-hidden" ref={lightboxEmblaRef}>
            <div className="flex h-full">
              {gallery.map((src, index) => {
                const displaySrc = failedGalleryIndexes.has(index) ? CONTACT_GALLERY_FALLBACK_SRC : src;
                const imageUnoptimized = shouldUnoptimizeRemoteImage(displaySrc);
                return (
                  <div key={`full-${src}-${index}`} className="min-w-0 flex-[0_0_100%]">
                    <div className="relative h-full w-full">
                      <Image
                        src={displaySrc}
                        alt={`${cityLabel} — галерея ${index + 1}`}
                        fill
                        unoptimized={imageUnoptimized}
                        className="object-contain"
                        sizes="100vw"
                        placeholder={imageUnoptimized ? "empty" : "blur"}
                        blurDataURL={imageUnoptimized ? undefined : IMAGE_BLUR_DATA_URL}
                        loading={Math.abs(index - lightboxIndex) <= 1 ? "eager" : "lazy"}
                        draggable={false}
                        onError={() => {
                          if (displaySrc === CONTACT_GALLERY_FALLBACK_SRC) return;
                          setFailedGalleryIndexes((prev) => {
                            if (prev.has(index)) return prev;
                            const next = new Set(prev);
                            next.add(index);
                            return next;
                          });
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {gallery.length > 1 ? (
            <div className="absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-black/85 via-black/60 to-transparent px-3 pb-3 pt-8">
              <div className="mx-auto flex max-w-4xl gap-2 overflow-x-auto pb-1">
                {gallery.map((src, index) => {
                  const displaySrc = failedGalleryIndexes.has(index) ? CONTACT_GALLERY_FALLBACK_SRC : src;
                  const imageUnoptimized = shouldUnoptimizeRemoteImage(displaySrc);
                  return (
                    <button
                      key={`thumb-${src}-${index}`}
                      type="button"
                      onClick={() => lightboxEmblaApi?.scrollTo(index)}
                      className={`relative h-14 w-24 shrink-0 overflow-hidden rounded-md border ${
                        index === lightboxIndex ? "border-white" : "border-white/30"
                      }`}
                      aria-label={`Открыть фото ${index + 1}`}
                    >
                      <Image
                        src={displaySrc}
                        alt=""
                        fill
                        unoptimized={imageUnoptimized}
                        className="object-cover"
                        sizes="96px"
                        placeholder={imageUnoptimized ? "empty" : "blur"}
                        blurDataURL={imageUnoptimized ? undefined : IMAGE_BLUR_DATA_URL}
                        loading={Math.abs(index - lightboxIndex) <= 1 ? "eager" : "lazy"}
                        draggable={false}
                        onError={() => {
                          if (displaySrc === CONTACT_GALLERY_FALLBACK_SRC) return;
                          setFailedGalleryIndexes((prev) => {
                            if (prev.has(index)) return prev;
                            const next = new Set(prev);
                            next.add(index);
                            return next;
                          });
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
