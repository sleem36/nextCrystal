"use client";

import { METRIKA_GOALS, trackGoal } from "@/lib/analytics";
import { toYouTubeEmbedUrl } from "@/lib/video-embed";

export function CarVideoSection({
  url,
  leadHref = "#lead-form",
  carId,
  city,
  paymentMethod,
}: {
  url?: string;
  leadHref?: string;
  carId?: string;
  city?: string;
  paymentMethod?: "credit" | "cash";
}) {
  const metrikaId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || 0) || undefined;
  if (!url) {
    return (
      <section className="flex h-full min-h-0 flex-col rounded-[var(--radius-card)] border border-slate-200 bg-white p-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h2 className="text-lg font-semibold text-[color:var(--color-brand-primary)]">Видеообзор</h2>
        <p className="mt-2 text-sm text-slate-600">
          Видео для этого автомобиля пока не загружено. По заявке отправим обзор в удобный мессенджер.
        </p>
        <div className="mt-auto pt-6">
          <a
            href={leadHref}
            onClick={() =>
              trackGoal(metrikaId, METRIKA_GOALS.videoReviewRequested, {
                ...(carId ? { carId } : {}),
                ...(city ? { city } : {}),
                ...(paymentMethod ? { paymentMethod } : {}),
                fromPage: "car_detail",
              })
            }
            className="btn-hover-primary inline-flex h-11 items-center justify-center rounded-[var(--radius-button,0.5rem)] bg-[color:var(--color-brand-accent)] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,118,234,0.35)] hover:bg-[color:var(--color-brand-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
          >
            Получить видеообзор
          </a>
        </div>
      </section>
    );
  }

  const embed = toYouTubeEmbedUrl(url);
  if (!embed) {
    return (
      <section className="flex h-full min-h-0 flex-col rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h2 className="text-lg font-semibold text-[color:var(--color-brand-primary)]">Видеообзор</h2>
        <p className="mt-2 text-sm text-slate-600">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[color:var(--color-brand-accent)] underline-offset-4 hover:underline"
          >
            Открыть видео в новой вкладке
          </a>
        </p>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col space-y-3">
      <h2 className="text-lg font-semibold text-[color:var(--color-brand-primary)] md:text-xl">Видеообзор</h2>
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-black shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="aspect-video w-full">
        <iframe
          src={embed}
          title="Видеообзор автомобиля"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
      </div>
    </section>
  );
}
