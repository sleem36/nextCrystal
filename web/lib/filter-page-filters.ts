import type { Car } from "@/types/car";

export type FilterPageFilters = {
  priceFrom?: number;
  priceTo?: number;
  yearFrom?: number;
  yearTo?: number;
  mileageFrom?: number;
  mileageTo?: number;
  bodyType?: string[];
  transmission?: string[];
  drive?: string[];
  ownersMax?: number;
  accidentFree?: boolean;
  color?: string;
  hasVideo?: boolean;
};

function toNumber(raw: FormDataEntryValue | null) {
  const value = String(raw ?? "").trim();
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toStringArray(raw: FormDataEntryValue | null) {
  const value = String(raw ?? "").trim();
  if (!value) return undefined;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildFiltersFromFormData(formData: FormData): FilterPageFilters {
  return {
    priceFrom: toNumber(formData.get("priceFrom")),
    priceTo: toNumber(formData.get("priceTo")),
    yearFrom: toNumber(formData.get("yearFrom")),
    yearTo: toNumber(formData.get("yearTo")),
    mileageFrom: toNumber(formData.get("mileageFrom")),
    mileageTo: toNumber(formData.get("mileageTo")),
    bodyType: toStringArray(formData.get("bodyType")),
    transmission: toStringArray(formData.get("transmission")),
    drive: toStringArray(formData.get("drive")),
    ownersMax: toNumber(formData.get("ownersMax")),
    accidentFree: formData.get("accidentFree") === "on",
    color: String(formData.get("color") ?? "").trim() || undefined,
    hasVideo: formData.get("hasVideo") === "on",
  };
}

export function getCarsWithFilters(cars: Car[], filters: FilterPageFilters): Car[] {
  return cars.filter((car) => {
    if (filters.priceFrom !== undefined && car.priceRub < filters.priceFrom) return false;
    if (filters.priceTo !== undefined && car.priceRub > filters.priceTo) return false;
    if (filters.yearFrom !== undefined && car.year < filters.yearFrom) return false;
    if (filters.yearTo !== undefined && car.year > filters.yearTo) return false;
    if (filters.mileageFrom !== undefined && car.mileageKm < filters.mileageFrom) return false;
    if (filters.mileageTo !== undefined && car.mileageKm > filters.mileageTo) return false;
    if (filters.bodyType?.length && !filters.bodyType.includes(car.bodyType)) return false;
    if (filters.transmission?.length && !filters.transmission.includes(car.transmission)) return false;
    if (filters.drive?.length && !filters.drive.includes(car.drive)) return false;
    if (filters.ownersMax !== undefined && car.passport.owners > filters.ownersMax) return false;
    if (filters.accidentFree && car.passport.accident.has) return false;
    if (filters.color && !car.color.toLowerCase().includes(filters.color.toLowerCase())) return false;
    if (filters.hasVideo && !car.videoReviewUrl) return false;
    return true;
  });
}
