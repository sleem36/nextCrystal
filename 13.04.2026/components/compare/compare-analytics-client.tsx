"use client";

import { useEffect } from "react";
import { METRIKA_GOALS, trackGoal } from "@/lib/analytics";

export function CompareAnalyticsClient({ ids }: { ids: string[] }) {
  const metrikaId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || 0) || undefined;

  useEffect(() => {
    trackGoal(metrikaId, METRIKA_GOALS.compareOpened, {
      compareCount: ids.length,
    });
  }, [ids.length, metrikaId]);

  return null;
}
