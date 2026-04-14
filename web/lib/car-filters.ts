import type { Car } from "@/types/car";
import type { CarBodyType } from "@/types/car";
import type {
  DriveFilter,
  FuelFilter,
  PaymentMethod,
  TransmissionFilter,
} from "@/components/landing/quick-selector";

/** Параметры листинга /cars — те же семантики, что у квиза на главной + расширения каталога */
export type CatalogSort =
  | "default"
  | "price_asc"
  | "price_desc"
  | "year_desc"
  | "year_asc"
  | "mileage_asc"
  | "mileage_desc"
  | "popular_desc";

export type OwnerBucket = "1" | "2" | "3plus";

export type CarListingFilters = {
  paymentMethod: PaymentMethod;
  monthlyBudget: number;
  maxPriceRub: number;
  priceMinRub: number;
  bodyType: CarBodyType | "any";
  transmission: TransmissionFilter;
  city: string;
  drive: DriveFilter;
  fuel: FuelFilter;
  yearFrom: number;
  yearTo: number;
  mileageFromKm: number;
  maxMileageKm: number;
  ownerBuckets: OwnerBucket[];
  accident: "any" | "none" | "yes";
  pts: "any" | "original" | "duplicate";
  /** Пустая строка = любой цвет */
  color: string;
  hasVideoOnly: boolean;
  withoutPaintOnly: boolean;
  search: string;
  sort: CatalogSort;
};

export const DEFAULT_CAR_LISTING_FILTERS: CarListingFilters = {
  paymentMethod: "credit",
  monthlyBudget: 35000,
  maxPriceRub: 2500000,
  priceMinRub: 0,
  bodyType: "any",
  transmission: "any",
  city: "Барнаул",
  drive: "any",
  fuel: "any",
  yearFrom: 2018,
  yearTo: new Date().getFullYear(),
  mileageFromKm: 0,
  maxMileageKm: 90000,
  ownerBuckets: [],
  accident: "any",
  pts: "any",
  color: "",
  hasVideoOnly: false,
  withoutPaintOnly: false,
  search: "",
  sort: "default",
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

const SORTS: CatalogSort[] = [
  "default",
  "price_asc",
  "price_desc",
  "year_desc",
  "year_asc",
  "mileage_asc",
  "mileage_desc",
  "popular_desc",
];

function parseSort(value: string | undefined): CatalogSort {
  if (!value) return "default";
  return SORTS.includes(value as CatalogSort) ? (value as CatalogSort) : "default";
}

const OWNER_BUCKETS: OwnerBucket[] = ["1", "2", "3plus"];

function parseOwnerBuckets(value: string | undefined): OwnerBucket[] {
  if (!value?.trim()) return [];
  const parts = value.split(",").map((s) => s.trim()).filter(Boolean);
  const out: OwnerBucket[] = [];
  for (const p of parts) {
    if (OWNER_BUCKETS.includes(p as OwnerBucket)) {
      out.push(p as OwnerBucket);
    }
  }
  return out;
}

function parseAccident(value: string | undefined): "any" | "none" | "yes" {
  if (value === "none" || value === "yes") return value;
  return "any";
}

function parsePts(value: string | undefined): "any" | "original" | "duplicate" {
  if (value === "original" || value === "duplicate") return value;
  return "any";
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
    maxPriceRub: parseIntParam(
      get("maxPriceRub") ?? get("priceMax"),
      DEFAULT_CAR_LISTING_FILTERS.maxPriceRub,
    ),
    priceMinRub: parseIntParam(
      get("priceMinRub") ?? get("priceMin"),
      DEFAULT_CAR_LISTING_FILTERS.priceMinRub,
    ),
    bodyType: parseBodyType(get("bodyType")),
    transmission: parseTransmission(get("transmission")),
    city: get("city")?.trim() || DEFAULT_CAR_LISTING_FILTERS.city,
    drive: parseDrive(get("drive")),
    fuel: parseFuel(get("fuel")),
    yearFrom: parseIntParam(get("yearFrom"), DEFAULT_CAR_LISTING_FILTERS.yearFrom),
    yearTo: parseIntParam(get("yearTo"), DEFAULT_CAR_LISTING_FILTERS.yearTo),
    mileageFromKm: parseIntParam(
      get("mileageFromKm") ?? get("mileageFrom"),
      DEFAULT_CAR_LISTING_FILTERS.mileageFromKm,
    ),
    maxMileageKm: parseIntParam(
      get("maxMileageKm") ?? get("mileageTo"),
      DEFAULT_CAR_LISTING_FILTERS.maxMileageKm,
    ),
    ownerBuckets: parseOwnerBuckets(get("owners")),
    accident: parseAccident(get("accident")),
    pts: parsePts(get("pts")),
    color: get("color")?.trim() ?? "",
    hasVideoOnly: get("hasVideo") === "1",
    withoutPaintOnly: get("withoutPaint") === "1",
    search: get("search")?.trim() ?? "",
    sort: parseSort(get("sort")),
  };
}

/** Ключи query, задающие фильтры листинга (без UTM и прочего) */
export const CATALOG_FILTER_PARAM_KEYS = [
  "paymentMethod",
  "monthlyBudget",
  "maxPriceRub",
  "priceMinRub",
  "bodyType",
  "transmission",
  "city",
  "drive",
  "fuel",
  "yearFrom",
  "yearTo",
  "mileageFromKm",
  "maxMileageKm",
  "owners",
  "accident",
  "pts",
  "color",
  "hasVideo",
  "withoutPaint",
  "search",
  "sort",
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
  if (f.priceMinRub > 0) {
    p.set("priceMinRub", String(f.priceMinRub));
  }
  if (f.bodyType !== "any") p.set("bodyType", f.bodyType);
  if (f.transmission !== "any") p.set("transmission", f.transmission);
  p.set("city", f.city);
  if (f.drive !== "any") p.set("drive", f.drive);
  if (f.fuel !== "any") p.set("fuel", f.fuel);
  p.set("yearFrom", String(f.yearFrom));
  p.set("yearTo", String(f.yearTo));
  if (f.mileageFromKm > 0) {
    p.set("mileageFromKm", String(f.mileageFromKm));
  }
  p.set("maxMileageKm", String(f.maxMileageKm));
  if (f.ownerBuckets.length > 0) {
    p.set("owners", f.ownerBuckets.join(","));
  }
  if (f.accident !== "any") {
    p.set("accident", f.accident);
  }
  if (f.pts !== "any") {
    p.set("pts", f.pts);
  }
  if (f.color.trim()) {
    p.set("color", f.color.trim());
  }
  if (f.hasVideoOnly) {
    p.set("hasVideo", "1");
  }
  if (f.withoutPaintOnly) {
    p.set("withoutPaint", "1");
  }
  if (f.search.trim()) {
    p.set("search", f.search.trim());
  }
  if (f.sort !== "default") {
    p.set("sort", f.sort);
  }
  return p;
}

function matchesBudgetCityBodyTransmission(car: Car, f: CarListingFilters): boolean {
  if (f.paymentMethod === "credit" && car.monthlyPaymentRub > f.monthlyBudget) return false;
  if (car.city !== f.city) return false;
  if (f.bodyType !== "any" && car.bodyType !== f.bodyType) return false;
  if (f.transmission !== "any" && car.transmission !== f.transmission) return false;
  return true;
}

function matchesPrice(car: Car, f: CarListingFilters): boolean {
  if (car.priceRub < f.priceMinRub) return false;
  if (car.priceRub > f.maxPriceRub) return false;
  return true;
}

function matchesSecondary(car: Car, f: CarListingFilters): boolean {
  if (car.year < f.yearFrom) return false;
  if (car.year > f.yearTo) return false;
  if (car.mileageKm < f.mileageFromKm) return false;
  if (car.mileageKm > f.maxMileageKm) return false;
  if (f.drive !== "any" && car.drive !== f.drive) return false;
  if (f.fuel !== "any" && car.fuel !== f.fuel) return false;
  return true;
}

function matchesOwners(car: Car, f: CarListingFilters): boolean {
  if (f.ownerBuckets.length === 0) return true;
  const o = car.passport.owners;
  return f.ownerBuckets.some((b) => {
    if (b === "1") return o === 1;
    if (b === "2") return o === 2;
    return o >= 3;
  });
}

function matchesAccident(car: Car, f: CarListingFilters): boolean {
  if (f.accident === "none" && car.passport.accident.has) return false;
  if (f.accident === "yes" && !car.passport.accident.has) return false;
  return true;
}

function matchesColor(car: Car, f: CarListingFilters): boolean {
  const q = f.color.trim().toLowerCase();
  if (!q) return true;
  return car.color.toLowerCase() === q || car.color.toLowerCase().includes(q);
}

function matchesVideo(car: Car, f: CarListingFilters): boolean {
  if (!f.hasVideoOnly) return true;
  return Boolean(car.videoReviewUrl);
}

function matchesPts(car: Car, f: CarListingFilters): boolean {
  if (f.pts === "any") return true;
  return car.passport.ptsStatus === f.pts;
}

function matchesWithoutPaint(car: Car, f: CarListingFilters): boolean {
  if (!f.withoutPaintOnly) return true;
  return (car.passport.paintedParts ?? []).length === 0;
}

function matchesSearch(car: Car, f: CarListingFilters): boolean {
  const q = f.search.trim().toLowerCase();
  if (!q) return true;
  const haystack = `${car.brand} ${car.model} ${car.city} ${car.id}`.toLowerCase();
  return haystack.includes(q);
}

/**
 * Авто, подходящие под фильтры **кроме** диапазона цены — для подписей min/max у слайдера.
 */
export function filterCarsForPriceBounds(cars: Car[], f: CarListingFilters): Car[] {
  return cars.filter(
    (car) =>
      matchesBudgetCityBodyTransmission(car, f) &&
      matchesSecondary(car, f) &&
      matchesOwners(car, f) &&
      matchesAccident(car, f) &&
      matchesPts(car, f) &&
      matchesColor(car, f) &&
      matchesVideo(car, f) &&
      matchesWithoutPaint(car, f) &&
      matchesSearch(car, f),
  );
}

export function filterCars(cars: Car[], f: CarListingFilters): Car[] {
  return cars.filter(
    (car) =>
      matchesBudgetCityBodyTransmission(car, f) &&
      matchesPrice(car, f) &&
      matchesSecondary(car, f) &&
      matchesOwners(car, f) &&
      matchesAccident(car, f) &&
      matchesPts(car, f) &&
      matchesColor(car, f) &&
      matchesVideo(car, f) &&
      matchesWithoutPaint(car, f),
  );
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
    priceMinRub: 0,
    yearFrom: relaxedYearFrom,
    yearTo: f.yearTo,
    mileageFromKm: 0,
    maxMileageKm: relaxedMileage,
    bodyType: "any",
    transmission: "any",
    drive: "any",
    fuel: "any",
    ownerBuckets: [],
    accident: "any",
    pts: "any",
    color: "",
    hasVideoOnly: false,
    withoutPaintOnly: false,
    search: "",
    sort: "default",
  };

  const scored = cars
    .filter((car) => {
      const budgetMatch =
        (relaxedFilters.paymentMethod === "cash" ||
          car.monthlyPaymentRub <= relaxedFilters.monthlyBudget) &&
        car.priceRub <= relaxedFilters.maxPriceRub;
      const cityMatch = car.city === f.city;
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
