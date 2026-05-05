"use client";

import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";
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

const compareStateStorage: PersistStorage<Pick<CompareState, "ids">> = {
  getItem: () => ({ state: { ids: readCompareIdsFromStorage() }, version: 0 }),
  setItem: (_name, value) => {
    writeCompareIdsToStorage(value.state.ids ?? []);
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
      storage: compareStateStorage,
      partialize: (s) => ({ ids: s.ids }),
    },
  ),
);
