"use client";

import Image from "next/image";
import { useSyncExternalStore, useState } from "react";
import { Button } from "@/components/ui/button";

const VIDEO_SRC = "/hero/hero-loop.mp4";
const POSTER_SRC = "/hero/poster.jpg";
const FALLBACK_IMG = "/hero/poster.jpg";
const HERO_BG_MODE_KEY = "heroBgMode";

type HeroBgMode = "video" | "image";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function subscribeHeroBgMode(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function getHeroBgModeSnapshot(): HeroBgMode | null {
  try {
    const saved = window.localStorage.getItem(HERO_BG_MODE_KEY);
    return saved === "video" || saved === "image" ? saved : null;
  } catch {
    return null;
  }
}

function getHeroBgModeServerSnapshot(): HeroBgMode | null {
  return null;
}

type HeroCompactProps = {
  onPrimaryClick: () => void;
};

export function HeroCompact({ onPrimaryClick }: HeroCompactProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [bgModeOverride, setBgModeOverride] = useState<HeroBgMode | null>(null);
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const savedBgMode = useSyncExternalStore(
    subscribeHeroBgMode,
    getHeroBgModeSnapshot,
    getHeroBgModeServerSnapshot,
  );

  const bgMode = bgModeOverride ?? savedBgMode ?? (reduceMotion ? "image" : "video");
  const showVideo = bgMode === "video" && !videoFailed;

  function setBgMode(mode: HeroBgMode) {
    setBgModeOverride(mode);
    setVideoFailed(false);
    try {
      window.localStorage.setItem(HERO_BG_MODE_KEY, mode);
    } catch {
      // Ignore storage errors to keep UI responsive.
    }
  }

  return (
    <section
      className="relative left-1/2 isolate w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden min-h-[88svh] md:min-h-[min(92svh,920px)]"
      aria-label="Первый экран"
    >
      {/* Фон на весь viewport: рендерим видео только в режиме "Видео". */}
      <div className="absolute inset-0 z-0">
        {bgMode === "image" ? (
          <Image
            src={POSTER_SRC}
            alt=""
            className="h-full w-full object-cover object-center"
            fill
            priority
            sizes="100vw"
          />
        ) : (
          <>
            <Image
              src={FALLBACK_IMG}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
              fill
              priority
              sizes="100vw"
            />
            {showVideo ? (
              <video
                className="hero-bg-video absolute inset-0 z-[1] h-full w-full object-cover object-center"
                src={VIDEO_SRC}
                poster={POSTER_SRC}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden
                onError={() => setVideoFailed(true)}
              />
            ) : null}
          </>
        )}
      </div>

      {/* Снизу и слева сильнее — читаемость белого текста */}
      <div
        className="absolute inset-0 z-[2] bg-gradient-to-t from-black/78 via-black/25 to-black/30"
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

      <div className="absolute right-3 top-3 z-[5] sm:right-4 sm:top-4">
        <div
          className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-black/40 p-1 backdrop-blur-[4px]"
          role="group"
          aria-label="Режим фона Hero: Видео или Картинка"
        >
          <button
            type="button"
            onClick={() => setBgMode("video")}
            aria-label="Включить фоновое видео"
            aria-pressed={bgMode === "video"}
            className={`rounded-full px-3 py-1.5 text-[11px] font-medium text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/30 sm:px-3.5 sm:text-xs ${
              bgMode === "video" ? "bg-white/22" : "bg-transparent hover:bg-white/10"
            }`}
          >
            Видео
          </button>
          <button
            type="button"
            onClick={() => setBgMode("image")}
            aria-label="Включить фоновую картинку"
            aria-pressed={bgMode === "image"}
            className={`rounded-full px-3 py-1.5 text-[11px] font-medium text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/30 sm:px-3.5 sm:text-xs ${
              bgMode === "image" ? "bg-white/22" : "bg-transparent hover:bg-white/10"
            }`}
          >
            Картинка
          </button>
        </div>
      </div>

      {/* Контент: напрямую на фоне, нижняя треть; без тяжёлой центральной карточки */}
      <div className="relative z-[4] mx-auto flex min-h-[88svh] max-w-3xl flex-col justify-end px-5 pb-10 pt-16 sm:px-6 sm:pb-12 md:min-h-[min(92svh,920px)] md:pb-14 md:pt-20">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 hero-text-shadow">
            Aurora Auto · Барнаул
          </p>

          <h1 className="hero-text-shadow mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-[1.85rem] md:leading-tight">
            Подержанные авто с проверкой и понятным платежом
          </h1>

          <p className="hero-text-shadow mt-2 text-sm leading-snug text-white/95 sm:text-base">
            Подбор и сопровождение сделки в Барнауле.
          </p>

          <p className="hero-text-shadow mt-3 max-w-md border-l-[3px] border-[color:var(--color-brand-accent)] pl-3 text-xs leading-snug text-white/90 sm:text-sm">
            Только подержанные автомобили — не новые и не под заказ.
          </p>

          <div className="mt-6">
            <Button
              className="w-full shadow-[0_4px_20px_rgba(0,118,234,0.35)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(0,118,234,0.42)] active:translate-y-0 sm:w-auto"
              onClick={onPrimaryClick}
            >
              Подобрать авто под мой бюджет
            </Button>
          </div>

          {/* Лёгкая glass-только у аккордеона — не сплошная плашка на весь блок */}
          <div className="mt-4 rounded-xl border border-white/15 bg-white/[0.07] backdrop-blur-[6px]">
            <button
              type="button"
              onClick={() => setDetailsOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-xs font-medium text-white/95 transition-colors duration-200 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20 sm:text-sm"
              aria-expanded={detailsOpen}
              aria-controls="hero-details-panel"
            >
              <span>Подробнее: доверие и условия</span>
              <span
                className="text-white/70 transition-transform duration-300 ease-out motion-reduce:duration-75"
                style={{ transform: detailsOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                ▼
              </span>
            </button>

            <div
              id="hero-details-panel"
              className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-[var(--easing-out)] motion-reduce:transition-none ${
                detailsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0">
                <div
                  className={`space-y-2 border-t border-white/15 px-3 pb-3 pt-2 text-xs text-white/75 transition-[opacity,transform] duration-300 ease-[var(--easing-out)] motion-reduce:transition-none sm:text-sm ${
                    detailsOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
                  }`}
                >
                  <p>Проверенные автомобили, прозрачные условия, без навязанных услуг.</p>
                  <p className="text-white/65">Условия зависят от авто и банка.</p>
                  <p className="font-medium text-white">
                    г. Барнаул, Павловский тракт, 249 · +7 (3852) 55-45-45
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
