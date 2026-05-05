"use client";

import { useCompareStore } from "@/stores/compare-store";

export function useCompareSelection() {
  const ids = useCompareStore((s) => s.ids);
  const toggle = useCompareStore((s) => s.toggle);
  const setCompareIds = useCompareStore((s) => s.setIds);

  return { compareIds: ids, setCompareIds, toggle };
}
