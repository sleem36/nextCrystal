"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const VIDEO_MP4_SRC = "/hero/background.mp4";

type HeroCompactProps = {
  onPrimaryClick: () => void;
  /** Вторичный CTA: переход в каталог (метрика + навигация через Link) */
  onCatalogClick?: () => void;
  catalogHref?: string;
};

export function HeroCompact({
  onPrimaryClick,
  onCatalogClick,
  catalogHref = "/cars",
}: HeroCompactProps) {
  return (
    <section
      className="relative left-1/2 isolate w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden min-h-[88svh] md:min-h-[min(92svh,920px)]"
      aria-label="Первый экран"
    >
      {/* Фон на весь viewport: только mp4-видео. */}
      <div className="absolute inset-0 z-0">
        <video
          className="hero-bg-video absolute inset-0 z-[1] h-full w-full object-cover object-center"
          src={VIDEO_MP4_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
      </div>

      {/* Снизу и слева сильнее — читаемость белого текста */}
      <div
        className="absolute inset-0 z-[2] bg-gradient-to-t from-black/85 via-black/30 to-black/35"
        aria-hidden
      />
      <div
        className="absolute inset-0 z-[2] bg-gradient-to-r from-black/65 via-black/25 to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_120%_80%_at_70%_20%,transparent_0%,rgba(0,0,0,0.2)_100%)]"
        aria-hidden
      />

      <div className="hero-grain absolute inset-0 z-[3]" aria-hidden />

      {/* Контент в заметной карточке, чтобы не сливаться с видео */}
      <div className="relative z-[4] mx-auto flex min-h-[88svh] max-w-3xl flex-col justify-end px-5 pb-10 pt-16 sm:px-6 sm:pb-12 md:min-h-[min(92svh,920px)] md:pb-14 md:pt-20">
        <div className="max-w-xl rounded-2xl border border-white/25 bg-slate-950/60 p-5 shadow-[0_16px_48px_rgba(0,0,0,0.55)] ring-1 ring-white/10 backdrop-blur-md md:rounded-3xl md:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/85">
            Aurora Auto · Барнаул
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[2.8rem] md:leading-[1.08]">
            Проверенные авто с пробегом
          </h1>

          <p className="mt-2 text-sm leading-snug text-white/95 sm:text-base">
            Подбор под платёж и сопровождение сделки в Барнауле. Только автомобили в наличии — не под заказ.
          </p>

          <div className="mt-4 grid gap-2 text-xs text-white/90 sm:text-sm">
            <p className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden />
              <span>Проверенные автомобили</span>
            </p>
            <p className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-sky-300" aria-hidden />
              <span>Прозрачные условия</span>
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
            <Button
              className="w-full shadow-[0_4px_20px_rgba(0,118,234,0.35)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(0,118,234,0.42)] active:translate-y-0 sm:min-w-[220px] sm:w-auto"
              onClick={onPrimaryClick}
            >
              Подобрать авто под мой бюджет
            </Button>
            <Link
              href={catalogHref}
              onClick={onCatalogClick}
              className="inline-flex h-11 min-h-11 w-full items-center justify-center gap-1.5 px-1 text-sm font-semibold text-white/90 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950/80 sm:w-auto sm:justify-start"
            >
              Смотреть каталог
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <p className="mt-5 border-t border-white/15 pt-4 text-xs leading-snug text-white/75 sm:text-sm">
            г. Барнаул, Павловский тракт, 249 ·{" "}
            <a href="tel:+73852554545" className="font-medium text-white underline-offset-2 hover:underline">
              +7 (3852) 55-45-45
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
