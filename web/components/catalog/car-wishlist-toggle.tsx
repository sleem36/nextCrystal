"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlist-store";

type CarWishlistToggleProps = {
  carId: string;
  className?: string;
};

export function CarWishlistToggle({ carId, className = "" }: CarWishlistToggleProps) {
  const wishlistIds = useWishlistStore((state) => state.ids);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isWishlisted = wishlistIds.includes(carId);

  return (
    <button
      type="button"
      onClick={() => toggleWishlist(carId)}
      className={`inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${className}`}
      aria-label={isWishlisted ? "Удалить из избранного" : "Добавить в избранное"}
      aria-pressed={isWishlisted}
    >
      <Heart className={`h-5 w-5 text-[color:var(--color-brand-accent)] ${isWishlisted ? "fill-current" : ""}`} />
      <span>{isWishlisted ? "В избранном" : "В избранное"}</span>
    </button>
  );
}

