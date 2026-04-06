"use client";

import { useEffect } from "react";
import { writeCompareIdsToStorage } from "@/lib/compare-selection";

/** Сохраняет id из URL сравнения в localStorage (шаринг / обновление страницы) */
export function CompareStorageSync({ ids }: { ids: string[] }) {
  useEffect(() => {
    writeCompareIdsToStorage(ids);
  }, [ids]);

  return null;
}
