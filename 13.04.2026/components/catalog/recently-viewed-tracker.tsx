"use client";

import { useEffect } from "react";
import { recordCarViewed } from "@/lib/recently-viewed";

/** Вызывать на странице /cars/[id] — пишет id в localStorage (последние 4). */
export function RecentlyViewedTracker({ carId }: { carId: string }) {
  useEffect(() => {
    recordCarViewed(carId);
  }, [carId]);

  return null;
}
