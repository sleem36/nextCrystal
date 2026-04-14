"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  ids: string[];
  has: (id: string) => boolean;
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  clear: () => void;
};

const MAX_WISHLIST_ITEMS = 100;

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      has: (id) => get().ids.includes(id),
      add: (id) =>
        set((state) => {
          if (state.ids.includes(id)) return state;
          return { ids: [...state.ids, id].slice(0, MAX_WISHLIST_ITEMS) };
        }),
      remove: (id) => set((state) => ({ ids: state.ids.filter((x) => x !== id) })),
      toggle: (id) =>
        set((state) => {
          if (state.ids.includes(id)) {
            return { ids: state.ids.filter((x) => x !== id) };
          }
          return { ids: [...state.ids, id].slice(0, MAX_WISHLIST_ITEMS) };
        }),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "wishlist_ids_v1",
      partialize: (state) => ({ ids: state.ids }),
    },
  ),
);

