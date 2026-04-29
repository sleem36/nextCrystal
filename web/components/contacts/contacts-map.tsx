"use client";

import { useEffect, useRef, useState } from "react";
import { contactSite } from "@/lib/contact-site";

type ContactsMapProps = {
  embedUrl: string;
  title: string;
  /** Ссылка «Открыть в Яндекс.Картах» до загрузки iframe (по выбранному филиалу) */
  externalMapsUrl?: string;
  /** Растянуть карту по высоте колонки (рядом с карточкой контактов на lg) */
  fillHeight?: boolean;
};

export function ContactsMap({ embedUrl, title, externalMapsUrl, fillHeight }: ContactsMapProps) {
  const [activeSrc, setActiveSrc] = useState<string | null>(null);
  const [mapInteractive, setMapInteractive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollBlockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActiveSrc(embedUrl);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [embedUrl]);

  /** Пока карта «заблокирована», колесо прокручивает страницу, а не масштабирует карту. */
  useEffect(() => {
    const el = scrollBlockRef.current;
    if (!el || !activeSrc || mapInteractive) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      window.scrollBy({ top: e.deltaY, left: e.deltaX, behavior: "auto" });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [activeSrc, mapInteractive]);

  /** На десктопе рядом с карточкой контактов высоту задаёт сетка — без min-h, иначе карта выше левого блока. */
  const mapFrameClass = fillHeight
    ? "relative min-h-[min(100vw,360px)] w-full flex-1 lg:min-h-0"
    : "relative aspect-[16/10] w-full md:aspect-[21/9]";

  return (
    <div
      ref={containerRef}
      className={`flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--border-soft)] bg-[color:var(--surface-card-muted)] shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${fillHeight ? "h-full min-h-0 max-lg:min-h-[min(100vw,360px)]" : ""}`}
    >
      <div className={mapFrameClass}>
        {activeSrc ? (
          <>
            <iframe
              title={title}
              src={activeSrc}
              className={`absolute inset-0 h-full w-full border-0 ${mapInteractive ? "" : "pointer-events-none"}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            {!mapInteractive ? (
              <div
                ref={scrollBlockRef}
                className="absolute inset-0 z-10 touch-pan-y"
                role="presentation"
              >
                <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-3 md:items-center md:p-4">
                  <button
                    type="button"
                    onClick={() => setMapInteractive(true)}
                    className="pointer-events-auto rounded-[var(--radius-button)] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)]/95 px-4 py-2.5 text-center text-sm font-semibold text-[color:var(--text-strong)] shadow-md backdrop-blur-sm transition-colors hover:bg-[color:var(--surface-card)]"
                  >
                    Нажмите, чтобы управлять картой
                  </button>
                </div>
              </div>
            ) : (
              <div className="pointer-events-none absolute right-2 top-2 z-10 md:right-3 md:top-3">
                <button
                  type="button"
                  onClick={() => setMapInteractive(false)}
                  className="pointer-events-auto rounded-[var(--radius-button)] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)]/95 px-3 py-1.5 text-xs font-semibold text-[color:var(--text-default)] shadow-md backdrop-blur-sm transition-colors hover:bg-[color:var(--surface-card)] md:text-sm"
                >
                  Вернуть прокрутку страницы
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-sm text-[color:var(--text-muted)]">
            <p className="max-w-sm">Карта загружается при прокрутке к блоку — страница остаётся быстрой.</p>
            <a
              href={externalMapsUrl ?? contactSite.mapsYandexUrl}
              className="font-medium text-[color:var(--color-link)] underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Открыть в Яндекс.Картах
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
