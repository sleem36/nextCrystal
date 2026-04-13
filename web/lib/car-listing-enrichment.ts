import type { Car } from "@/types/car";
import type { CatalogSort } from "@/lib/car-filters";

export function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Детерминированные поля для листинга, если их нет в данных */
export function getListingDerived(car: Car) {
  const h = hashString(car.id);
  const viewCount = car.viewCount ?? 8 + (h % 48);
  const bookingCount = car.bookingCount ?? (h % 4);
  const bump = (7 + (h % 22)) * 10000;
  const oldPriceRub = car.oldPriceRub ?? car.priceRub + bump;
  const showPromoBadge = h % 10 < 3;
  const promoKind: "hit" | "negotiable" = h % 2 === 0 ? "hit" : "negotiable";
  return { viewCount, bookingCount, oldPriceRub, showPromoBadge, promoKind };
}

export function getPopularityScore(car: Car) {
  const { viewCount, bookingCount } = getListingDerived(car);
  return viewCount + bookingCount * 8;
}

export function sortCatalogCars(list: Car[], sort: CatalogSort): Car[] {
  const out = [...list];
  switch (sort) {
    case "price_asc":
      return out.sort((a, b) => a.priceRub - b.priceRub);
    case "price_desc":
      return out.sort((a, b) => b.priceRub - a.priceRub);
    case "year_desc":
      return out.sort((a, b) => b.year - a.year);
    case "year_asc":
      return out.sort((a, b) => a.year - b.year);
    case "mileage_asc":
      return out.sort((a, b) => a.mileageKm - b.mileageKm);
    case "mileage_desc":
      return out.sort((a, b) => b.mileageKm - a.mileageKm);
    case "popular_desc":
      return out.sort((a, b) => getPopularityScore(b) - getPopularityScore(a));
    default:
      return out;
  }
}
