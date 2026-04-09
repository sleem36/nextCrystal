import type { Car } from "@/types/car";
import type { CarBodyType } from "@/types/car";
import type {
  DriveFilter,
  FuelFilter,
  PaymentMethod,
  TransmissionFilter,
} from "@/components/landing/quick-selector";

/** Параметры листинга /cars — те же семантики, что у квиза на главной */
export type CarListingFilters = {
  paymentMethod: PaymentMethod;
  monthlyBudget: number;
  maxPriceRub: number;
  bodyType: CarBodyType | "any";
  transmission: TransmissionFilter;
  city: string;
  drive: DriveFilter;
  fuel: FuelFilter;
  yearFrom: number;
  maxMileageKm: number;
};

export const DEFAULT_CAR_LISTING_FILTERS: CarListingFilters = {
  paymentMethod: "credit",
  monthlyBudget: 35000,
  maxPriceRub: 2500000,
  bodyType: "any",
  transmission: "any",
  city: "Барнаул",
  drive: "any",
  fuel: "any",
  yearFrom: 2018,
  maxMileageKm: 90000,
};

function parseIntParam(value: string | undefined, fallback: number): number {
  if (value === undefined || value === "") return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

const BODY_TYPES: Array<CarBodyType | "any"> = ["any", "sedan", "liftback", "suv", "hatchback"];

function parseBodyType(value: string | undefined): CarBodyType | "any" {
  if (!value || value === "any") return "any";
  return BODY_TYPES.includes(value as CarBodyType) ? (value as CarBodyType) : "any";
}

const TRANS: TransmissionFilter[] = ["any", "automatic", "manual"];

function parseTransmission(value: string | undefined): TransmissionFilter {
  if (!value) return "any";
  return TRANS.includes(value as TransmissionFilter) ? (value as TransmissionFilter) : "any";
}

const DRIVES: DriveFilter[] = ["any", "fwd", "rwd", "awd"];

function parseDrive(value: string | undefined): DriveFilter {
  if (!value) return "any";
  return DRIVES.includes(value as DriveFilter) ? (value as DriveFilter) : "any";
}

const FUELS: FuelFilter[] = ["any", "petrol", "diesel", "hybrid", "electric"];
const PAYMENT_METHODS: PaymentMethod[] = ["credit", "cash"];

function parseFuel(value: string | undefined): FuelFilter {
  if (!value) return "any";
  if (value === "electric") return "any";
  return FUELS.includes(value as FuelFilter) ? (value as FuelFilter) : "any";
}

function parsePaymentMethod(value: string | undefined): PaymentMethod {
  if (!value) return "credit";
  return PAYMENT_METHODS.includes(value as PaymentMethod) ? (value as PaymentMethod) : "credit";
}

/** Разбор querystring для /cars */
export function parseCarListingSearchParams(
  raw: Record<string, string | string[] | undefined>,
): CarListingFilters {
  const get = (key: string): string | undefined => {
    const v = raw[key];
    if (Array.isArray(v)) return v[0];
    return v;
  };

  return {
    paymentMethod: parsePaymentMethod(get("paymentMethod")),
    monthlyBudget: parseIntParam(get("monthlyBudget"), DEFAULT_CAR_LISTING_FILTERS.monthlyBudget),
    maxPriceRub: parseIntParam(get("maxPriceRub"), DEFAULT_CAR_LISTING_FILTERS.maxPriceRub),
    bodyType: parseBodyType(get("bodyType")),
    transmission: parseTransmission(get("transmission")),
    city: get("city")?.trim() || DEFAULT_CAR_LISTING_FILTERS.city,
    drive: parseDrive(get("drive")),
    fuel: parseFuel(get("fuel")),
    yearFrom: parseIntParam(get("yearFrom"), DEFAULT_CAR_LISTING_FILTERS.yearFrom),
    maxMileageKm: parseIntParam(get("maxMileageKm"), DEFAULT_CAR_LISTING_FILTERS.maxMileageKm),
  };
}

/** Ключи query, задающие фильтры листинга (без UTM и прочего) */
export const CATALOG_FILTER_PARAM_KEYS = [
  "paymentMethod",
  "monthlyBudget",
  "maxPriceRub",
  "bodyType",
  "transmission",
  "city",
  "drive",
  "fuel",
  "yearFrom",
  "maxMileageKm",
] as const;

export function hasCatalogFilterParams(searchParams: URLSearchParams): boolean {
  return CATALOG_FILTER_PARAM_KEYS.some((key) => searchParams.has(key));
}

export function carListingFiltersToSearchParams(f: CarListingFilters): URLSearchParams {
  const p = new URLSearchParams();
  p.set("paymentMethod", String(f.paymentMethod));
  if (f.paymentMethod === "credit") {
    p.set("monthlyBudget", String(f.monthlyBudget));
  }
  p.set("maxPriceRub", String(f.maxPriceRub));
  if (f.bodyType !== "any") p.set("bodyType", f.bodyType);
  if (f.transmission !== "any") p.set("transmission", f.transmission);
  p.set("city", f.city);
  if (f.drive !== "any") p.set("drive", f.drive);
  if (f.fuel !== "any") p.set("fuel", f.fuel);
  p.set("yearFrom", String(f.yearFrom));
  p.set("maxMileageKm", String(f.maxMileageKm));
  return p;
}

function matchesPrimary(car: Car, f: CarListingFilters): boolean {
  if (f.paymentMethod === "credit" && car.monthlyPaymentRub > f.monthlyBudget) return false;
  if (car.priceRub > f.maxPriceRub) return false;
  if (!car.cities.includes(f.city)) return false;
  if (f.bodyType !== "any" && car.bodyType !== f.bodyType) return false;
  if (f.transmission !== "any" && car.transmission !== f.transmission) return false;
  return true;
}

function matchesSecondary(car: Car, f: CarListingFilters): boolean {
  if (car.year < f.yearFrom) return false;
  if (car.mileageKm > f.maxMileageKm) return false;
  if (f.drive !== "any" && car.drive !== f.drive) return false;
  if (f.fuel !== "any" && car.fuel !== f.fuel) return false;
  return true;
}

export function filterCars(cars: Car[], f: CarListingFilters): Car[] {
  return cars.filter((car) => matchesPrimary(car, f) && matchesSecondary(car, f));
}

/** Смягчённые параметры — как на главной при «расширенной» выдаче */
export function getRelaxedSuggestions(cars: Car[], f: CarListingFilters): Car[] {
  const relaxedMonthlyBudget = Math.round(f.monthlyBudget * 1.2);
  const relaxedMaxPrice = Math.round(f.maxPriceRub * 1.15);
  const relaxedYearFrom = Math.max(2005, f.yearFrom - 2);
  const relaxedMileage = f.maxMileageKm + 30000;

  const relaxedFilters: CarListingFilters = {
    ...f,
    monthlyBudget: relaxedMonthlyBudget,
    maxPriceRub: relaxedMaxPrice,
    yearFrom: relaxedYearFrom,
    maxMileageKm: relaxedMileage,
    bodyType: "any",
    transmission: "any",
    drive: "any",
    fuel: "any",
  };

  const scored = cars
    .filter((car) => {
      const budgetMatch =
        (relaxedFilters.paymentMethod === "cash" ||
          car.monthlyPaymentRub <= relaxedFilters.monthlyBudget) &&
        car.priceRub <= relaxedFilters.maxPriceRub;
      const cityMatch = car.cities.includes(f.city);
      const bodyMatch = f.bodyType === "any" || car.bodyType === f.bodyType;
      const transmissionMatch =
        f.transmission === "any" || car.transmission === f.transmission;
      const driveMatch = f.drive === "any" || car.drive === f.drive;
      const fuelMatch = f.fuel === "any" || car.fuel === f.fuel;
      const yearMatch = car.year >= relaxedYearFrom;
      const mileageMatch = car.mileageKm <= relaxedMileage;
      return (
        budgetMatch &&
        yearMatch &&
        mileageMatch &&
        (cityMatch || bodyMatch) &&
        transmissionMatch &&
        driveMatch &&
        fuelMatch
      );
    })
    .sort((a, b) => {
      const scoreA =
        (f.paymentMethod === "credit" ? Math.abs(a.monthlyPaymentRub - f.monthlyBudget) : 0) +
        Math.abs(a.priceRub - f.maxPriceRub) / 50;
      const scoreB =
        (f.paymentMethod === "credit" ? Math.abs(b.monthlyPaymentRub - f.monthlyBudget) : 0) +
        Math.abs(b.priceRub - f.maxPriceRub) / 50;
      return scoreA - scoreB;
    });

  return scored.slice(0, 8);
}
