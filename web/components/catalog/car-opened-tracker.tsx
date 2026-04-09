"use client";

import { useEffect } from "react";
import { METRIKA_GOALS, trackGoal } from "@/lib/analytics";

type CarOpenedTrackerProps = {
  carId: string;
  city: string;
  monthlyBudget: number;
  maxPriceRub: number;
  bodyType: string;
  transmission: string;
};

export function CarOpenedTracker({
  carId,
  city,
  monthlyBudget,
  maxPriceRub,
  bodyType,
  transmission,
}: CarOpenedTrackerProps) {
  const metrikaId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || 0) || undefined;

  useEffect(() => {
    trackGoal(metrikaId, METRIKA_GOALS.carOpened, {
      carId,
      paymentMethod: "credit",
      city,
      monthlyBudget,
      maxPriceRub,
      bodyType,
      transmission,
    });
  }, [bodyType, carId, city, maxPriceRub, metrikaId, monthlyBudget, transmission]);

  return null;
}
