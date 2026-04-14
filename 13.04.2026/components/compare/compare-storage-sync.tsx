"use client";

import { useEffect } from "react";
import { useCompareStore } from "@/stores/compare-store";

/** Подтягивает id из URL сравнения в store и localStorage (шаринг / обновление страницы) */
export function CompareStorageSync({ ids }: { ids: string[] }) {
  useEffect(() => {
    useCompareStore.getState().setIds(ids);
  }, [ids]);

  return null;
}
