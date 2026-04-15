"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Card } from "@/components/ui/card";
import { reviews } from "@/lib/reviews-data";

function Stars({ rating }: { rating: 5 | 4 | 3 }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-500" aria-label={`Оценка ${rating} из 5`}>
      {Array.from({ length: 5 }).map((_, idx) => (
        <span key={idx} className={idx < rating ? "opacity-100" : "opacity-25"}>
          ★
        </span>
      ))}
      <span className="ml-1 text-xs font-semibold text-slate-600">{rating}/5</span>
    </div>
  );
}

export function ReviewsSection({ className = "" }: { className?: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    dragFree: false,
    containScroll: "trimSnaps",
    duration: 22,
  });
  const [selectedSnap, setSelectedSnap] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setSelectedSnap(emblaApi.selectedScrollSnap());
      setSnapCount(emblaApi.scrollSnapList().length);
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    update();
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);
    return () => {
      emblaApi.off("select", update);
      emblaApi.off("reInit", update);
    };
  }, [emblaApi]);

  return (
    <section className={`container-wide mt-10 md:mt-14 ${className}`.trim()} aria-labelledby="reviews-heading">
      <div className="rounded-[var(--radius-card)] border border-slate-200 bg-gradient-to-b from-white to-slate-50/70 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 md:mb-7">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
            Реальные отзывы
          </span>
          <h2
            id="reviews-heading"
            className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--color-brand-primary)] md:text-3xl"
          >
            Отзывы наших клиентов
          </h2>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            Реальные отзывы о покупке автомобилей.
          </p>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canPrev}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-xl text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Предыдущий отзыв"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canNext}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-xl text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Следующий отзыв"
          >
            ›
          </button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-3 md:-ml-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="min-w-0 flex-[0_0_90%] pl-3 sm:flex-[0_0_72%] md:flex-[0_0_50%] md:pl-4 xl:flex-[0_0_33.333%]"
            >
              <Card className="h-full rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_4px_18px_rgba(0,0,0,0.06)] md:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={review.avatar} alt={review.name} className="h-16 w-16 rounded-full object-cover ring-2 ring-slate-100 md:h-20 md:w-20" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 md:text-base">{review.name}</p>
                      <p className="text-xs text-slate-500">{review.date}</p>
                    </div>
                  </div>
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[color:var(--color-brand-accent)]">
                    <Quote className="h-4 w-4" aria-hidden />
                  </span>
                </div>
                <div className="mt-2 min-w-0">
                  <div className="mt-2">
                    <Stars rating={review.rating} />
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-700 md:text-[15px]">{review.text}</p>

                {review.carModel ? (
                  <p className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                    Купили: {review.carModel}
                  </p>
                ) : null}

                {review.fullReviewUrl ? (
                  <a
                    href={review.fullReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex text-xs font-semibold text-[color:var(--color-brand-accent)] underline-offset-4 hover:underline"
                  >
                    Полный отзыв
                  </a>
                ) : null}
              </Card>
            </div>
          ))}
        </div>
      </div>

      {snapCount > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-1.5 md:hidden">
          {Array.from({ length: snapCount }).map((_, idx) => (
            <button
              key={`dot-${idx}`}
              type="button"
              onClick={() => emblaApi?.scrollTo(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === selectedSnap ? "w-6 bg-[color:var(--color-brand-accent)]" : "w-2 bg-slate-300"
              }`}
              aria-label={`Перейти к отзыву ${idx + 1}`}
            />
          ))}
        </div>
      ) : null}
      </div>
    </section>
  );
}
