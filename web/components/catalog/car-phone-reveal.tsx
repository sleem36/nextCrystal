"use client";

import { useState } from "react";
import { METRIKA_GOALS, trackGoal } from "@/lib/analytics";

export function CarPhoneReveal({
  phoneLabel = "+7 (3852) 55-45-45",
}: {
  phoneLabel?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const metrikaId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || 0) || undefined;
  const phoneHref = `tel:${phoneLabel.replace(/\D/g, "")}`;

  return (
    <div className="mt-3">
      {!revealed ? (
        <button
          type="button"
          onClick={() => {
            setRevealed(true);
            trackGoal(metrikaId, METRIKA_GOALS.phoneRevealed);
          }}
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button,0.5rem)] border border-slate-300 bg-white px-5 text-sm font-semibold text-[color:var(--color-brand-primary)] transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-primary)] focus-visible:ring-offset-2"
        >
          Показать номер
        </button>
      ) : (
        <a
          href={phoneHref}
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button,0.5rem)] border border-slate-300 bg-white px-5 text-sm font-semibold text-[color:var(--color-brand-primary)] transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-primary)] focus-visible:ring-offset-2"
        >
          {phoneLabel}
        </a>
      )}
    </div>
  );
}
