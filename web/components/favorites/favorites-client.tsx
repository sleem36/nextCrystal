"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { Heart } from "lucide-react";
import { BookingModal } from "@/components/catalog/booking-modal";
import { CatalogCarCard } from "@/components/catalog/catalog-car-card";
import { useBookedCars } from "@/hooks/use-booked-cars";
import { useCompareSelection } from "@/hooks/use-compare-selection";
import { DEFAULT_CAR_LISTING_FILTERS } from "@/lib/car-filters";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { Car } from "@/types/car";

type FavoritesClientProps = {
  cars: Car[];
};

export function FavoritesClient({ cars }: FavoritesClientProps) {
  const wishlistIds = useWishlistStore((state) => state.ids);
  const removeFromWishlist = useWishlistStore((state) => state.remove);
  const { compareIds, toggle } = useCompareSelection();
  const { bookedIds, bookedUntilMap, refresh } = useBookedCars();

  const [leadModalState, setLeadModalState] = useState<{
    car: Car;
    type: "reservation" | "credit";
  } | null>(null);
  const [bookingSubmittingId, setBookingSubmittingId] = useState<string | null>(null);
  const [creditSubmittingId, setCreditSubmittingId] = useState<string | null>(null);

  const carsById = useMemo(() => new Map(cars.map((car) => [car.id, car])), [cars]);
  const favoriteCars = useMemo(
    () => wishlistIds.map((id) => carsById.get(id)).filter((car): car is Car => Boolean(car)),
    [wishlistIds, carsById],
  );

  useEffect(() => {
    void useWishlistStore.persist.rehydrate();
  }, []);

  const stopCardNavigation = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  if (favoriteCars.length === 0) {
    return (
      <section className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h2 className="text-xl font-semibold text-[color:var(--color-brand-primary)]">Избранное</h2>
        <p className="mt-2 text-sm text-slate-600">У вас пока нет избранных авто</p>
        <Link
          href="/cars"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-[var(--radius-button,0.5rem)] bg-[color:var(--color-brand-accent)] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(220,38,38,0.35)] transition-colors hover:bg-[color:var(--color-brand-accent-hover)]"
        >
          Перейти в каталог
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-4" aria-label="Избранные автомобили">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-[color:var(--color-brand-primary)] md:text-2xl">
            Избранные автомобили
          </h2>
          <span className="text-sm text-slate-600">
            {favoriteCars.length} {favoriteCars.length === 1 ? "вариант" : "вариантов"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-3">
          {favoriteCars.map((car, index) => (
            <div key={car.id} className="relative">
              <button
                type="button"
                onClick={(event) => {
                  stopCardNavigation(event);
                  removeFromWishlist(car.id);
                }}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                className="absolute right-2 top-2 z-10 inline-flex h-9 items-center gap-1 rounded-lg border border-rose-200 bg-white/95 px-2 text-xs font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50"
                aria-label={`Удалить ${car.brand} ${car.model} из избранного`}
              >
                <Heart className="h-4 w-4 fill-current" />
                <span className="hidden sm:inline">Удалить</span>
              </button>

              <CatalogCarCard
                car={car}
                animationIndex={index}
                imagePriority={index < 4}
                isBooked={bookedIds.has(car.id)}
                bookedUntilMs={bookedUntilMap[car.id] ?? null}
                isBookingSubmitting={bookingSubmittingId === car.id}
                isCreditSubmitting={creditSubmittingId === car.id}
                onRequestBooking={(nextCar) => setLeadModalState({ car: nextCar, type: "reservation" })}
                onRequestCredit={(nextCar) => setLeadModalState({ car: nextCar, type: "credit" })}
                compare={{
                  checked: compareIds.includes(car.id),
                  disabled: !compareIds.includes(car.id) && compareIds.length >= 3,
                  onToggle: () => toggle(car.id),
                }}
              />
            </div>
          ))}
        </div>
      </section>

      <BookingModal
        car={leadModalState?.car ?? null}
        type={leadModalState?.type ?? "reservation"}
        open={leadModalState != null}
        onClose={() => {
          setLeadModalState(null);
          setBookingSubmittingId(null);
          setCreditSubmittingId(null);
        }}
        filters={DEFAULT_CAR_LISTING_FILTERS}
        utm={{}}
        onBooked={refresh}
        onSubmittingChange={(submitting, carId, type) => {
          if (type === "reservation") {
            setBookingSubmittingId(submitting ? carId : null);
            return;
          }
          setCreditSubmittingId(submitting ? carId : null);
        }}
      />
    </>
  );
}

