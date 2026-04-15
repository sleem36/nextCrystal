"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { readRecentlyViewedIds } from "@/lib/recently-viewed";
import { useWishlistStore } from "@/stores/wishlist-store";
import { getResolvedCarImages } from "@/lib/car-images-map";
import type { Car } from "@/types/car";

function primaryImageSrc(car: Car) {
  return getResolvedCarImages(car)[0];
}

type RecentlyViewedProps = {
  cars: Car[];
};

export function RecentlyViewed({ cars }: RecentlyViewedProps) {
  const [ids, setIds] = useState<string[]>([]);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isWishlisted = useWishlistStore((state) => state.has);

  useEffect(() => {
    const sync = () => setIds(readRecentlyViewedIds());
    queueMicrotask(sync);
    window.addEventListener("recently-viewed-changed", sync);
    return () => window.removeEventListener("recently-viewed-changed", sync);
  }, []);

  const list = useMemo(() => {
    const map = new Map(cars.map((c) => [c.id, c]));
    return ids.map((id) => map.get(id)).filter((c): c is Car => c != null);
  }, [cars, ids]);

  if (list.length === 0) {
    return null;
  }

  return (
    <section
      className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-[0_4px_18px_rgba(0,0,0,0.06)] md:p-5"
      aria-label="Недавно смотрели"
    >
      <h2 className="text-lg font-semibold text-[color:var(--color-brand-primary)]">Недавно смотрели</h2>
      <p className="mt-1 text-sm text-slate-600">До четырёх последних карточек с этого устройства.</p>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {list.map((car) => {
          const src = primaryImageSrc(car);
          const wished = isWishlisted(car.id);
          return (
            <li key={car.id} className="relative">
              <button
                type="button"
                className="absolute right-2 top-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/60 bg-white/90 text-rose-600 shadow-md backdrop-blur-sm transition hover:bg-white"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  toggleWishlist(car.id);
                }}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                aria-label={wished ? "Удалить из избранного" : "Добавить в избранное"}
                aria-pressed={wished}
              >
                <Heart className={`h-5 w-5 ${wished ? "fill-current" : ""}`} />
              </button>
              <Link
                href={`/cars/${car.id}`}
                className="group block overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition hover:border-[color:var(--color-brand-accent)] hover:shadow-md"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element -- те же URL, что в VehicleGallery (любой хост) */}
                  <img
                    src={src}
                    alt={`${car.brand} ${car.model}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                    loading="lazy"
                    decoding="async"
                    width={480}
                    height={300}
                  />
                </div>
                <div className="space-y-0.5 p-2.5">
                  <p className="line-clamp-2 text-xs font-semibold text-slate-900 group-hover:text-[color:var(--color-brand-accent)]">
                    {car.brand} {car.model}, {car.year}
                  </p>
                  <p className="text-xs font-medium text-slate-700">{formatCurrency(car.priceRub)}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
