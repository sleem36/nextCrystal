"use client";

import { useCallback, useEffect, useState } from "react";
import {
  COMPARE_STORAGE_KEY,
  readCompareIdsFromStorage,
  toggleCompareId as applyToggleCompareId,
  writeCompareIdsToStorage,
} from "@/lib/compare-selection";

export function useCompareSelection() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    // Гидратация выбора из localStorage после монтирования (нет window на SSR)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- гидратация из localStorage
    setIds(readCompareIdsFromStorage());
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === COMPARE_STORAGE_KEY && event.newValue != null) {
        try {
          const parsed = JSON.parse(event.newValue) as unknown;
          if (Array.isArray(parsed)) {
            setIds(parsed.filter((x): x is string => typeof x === "string"));
          }
        } catch {
          setIds([]);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setCompareIds = useCallback((next: string[]) => {
    const sliced = next.slice(0, 3);
    setIds(sliced);
    writeCompareIdsToStorage(sliced);
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = applyToggleCompareId(prev, id);
      writeCompareIdsToStorage(next);
      return next;
    });
  }, []);

  return { compareIds: ids, setCompareIds, toggle };
}
