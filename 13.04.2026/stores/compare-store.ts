"use client";

import { create } from "zustand";
import { persist, type PersistStorage, type StateStorage } from "zustand/middleware";
import {
  COMPARE_STORAGE_KEY,
  MAX_COMPARE_CARS,
  readCompareIdsFromStorage,
  toggleCompareId,
  writeCompareIdsToStorage,
} from "@/lib/compare-selection";

type CompareState = {
  ids: string[];
  toggle: (id: string) => void;
  setIds: (ids: string[]) => void;
};

const compareStateStorage: StateStorage = {
  getItem: () => {
    const ids = readCompareIdsFromStorage();
    return JSON.stringify({ state: { ids }, version: 0 });
  },
  setItem: (_name, value) => {
    try {
      const parsed =
        typeof value === "string"
          ? (JSON.parse(value) as { state?: { ids?: string[] } })
          : (value as { state?: { ids?: string[] } });
      writeCompareIdsToStorage(parsed.state?.ids ?? []);
    } catch {
      // ignore
    }
  },
  removeItem: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(COMPARE_STORAGE_KEY);
    }
  },
};

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => set({ ids: toggleCompareId(get().ids, id) }),
      setIds: (ids) => set({ ids: ids.slice(0, MAX_COMPARE_CARS) }),
    }),
    {
      name: COMPARE_STORAGE_KEY,
      storage: compareStateStorage as unknown as PersistStorage<{ ids: string[] }>,
      partialize: (s) => ({ ids: s.ids }),
      skipHydration: true,
    },
  ),
);
