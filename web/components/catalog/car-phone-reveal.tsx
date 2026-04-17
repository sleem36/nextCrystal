"use client";

import { useState } from "react";
import { METRIKA_GOALS, trackGoal } from "@/lib/analytics";

export function CarPhoneReveal({
  phoneLabel = "+7 (3852) 55-45-45",
  className = "mt-3",
  carId,
  city,
  paymentMethod,
}: {
  phoneLabel?: string;
  className?: string;
  carId?: string;
  city?: string;
  paymentMethod?: "credit" | "cash";
}) {
  const [revealed, setRevealed] = useState(false);
  const metrikaId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || 0) || undefined;
  const phoneHref = `tel:${phoneLabel.replace(/\D/g, "")}`;
  const secondaryCtaClass =
    "btn-hover-secondary inline-flex h-11 items-center justify-center rounded-[var(--radius-button,0.5rem)] border border-slate-300 bg-white px-5 text-sm font-semibold text-[color:var(--color-brand-primary)] hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-primary)] focus-visible:ring-offset-2";

  return (
    <div className={className}>
      {!revealed ? (
        <button
          type="button"
          onClick={() => {
            setRevealed(true);
            trackGoal(metrikaId, METRIKA_GOALS.phoneRevealed, {
              ...(carId ? { carId } : {}),
              ...(city ? { city } : {}),
              ...(paymentMethod ? { paymentMethod } : {}),
              fromPage: "car_detail",
            });
          }}
          className={secondaryCtaClass}
        >
          Показать номер
        </button>
      ) : (
        <a
          href={phoneHref}
          className={secondaryCtaClass}
        >
          {phoneLabel}
        </a>
      )}
    </div>
  );
}
