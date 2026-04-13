"use client";

import { useEffect } from "react";
import { useCompareStore } from "@/stores/compare-store";

export function useCompareSelection() {
  const ids = useCompareStore((s) => s.ids);
  const toggle = useCompareStore((s) => s.toggle);
  const setCompareIds = useCompareStore((s) => s.setIds);

  useEffect(() => {
    void useCompareStore.persist.rehydrate();
  }, []);

  return { compareIds: ids, setCompareIds, toggle };
}
