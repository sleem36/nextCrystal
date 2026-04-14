import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import type { Car } from "@/types/car";

const carAccidentSchema = z.object({
  has: z.boolean(),
  note: z.string().optional(),
});

const carPassportSchema = z.object({
  owners: z.number().int().min(1),
  ptsStatus: z.enum(["original", "duplicate"]),
  mileageVerified: z.boolean(),
  accident: carAccidentSchema,
  paintedParts: z.array(z.string()).optional(),
  warrantyWork: z.string().optional(),
});

/** Схема одной машины: парсинг mock/API до попадания в UI */
export const carSchema = z.object({
  id: z.string(),
  brand: z.string(),
  model: z.string(),
  year: z.number().int(),
  mileageKm: z.number().nonnegative(),
  priceRub: z.number().positive(),
  monthlyPaymentRub: z.number().nonnegative(),
  bodyType: z.enum(["sedan", "liftback", "suv", "hatchback"]),
  transmission: z.enum(["automatic", "manual"]),
  drive: z.enum(["fwd", "rwd", "awd"]),
  fuel: z.enum(["petrol", "diesel", "hybrid"]),
  color: z.string(),
  city: z.string().optional(),
  cities: z.array(z.string()).optional(),
  images: z.array(z.string().url()).min(1),
  trustPoints: z.array(z.string()),
  tags: z.array(z.enum(["family", "first-car", "city", "comfort"])),
  passport: carPassportSchema,
  ownersCount: z.number().int().min(1).optional(),
  pts: z.enum(["original", "duplicate"]).optional(),
  accident: z.boolean().optional(),
  videoReviewUrl: z.string().url().optional(),
  oldPriceRub: z.number().positive().optional(),
  viewCount: z.number().int().nonnegative().optional(),
  bookingCount: z.number().int().nonnegative().optional(),
});

export const carsArraySchema = z.array(carSchema);

function parseCarsPayload(data: unknown): Car[] {
  const parsed = carsArraySchema.parse(data);
  return parsed.map((car) => {
    const cityFromArray = car.cities?.find((item) => item.trim());
    const city = car.city?.trim() || cityFromArray || "Барнаул";
    if (!car.city && car.cities && car.cities.length > 1) {
      // TODO: when external source is normalized, remove fallback from cities[].
      console.warn(`[cars-source] multiple cities for ${car.id}; using first valid city "${city}"`);
    }
    return {
      ...car,
      city,
    };
  });
}

async function loadCarsFromFile(): Promise<Car[]> {
  const filePath = join(process.cwd(), "data", "cars-real.json");
  const file = await readFile(filePath, "utf-8");
  const parsed: unknown = JSON.parse(file);
  return parseCarsPayload(parsed);
}

async function loadCarsFromExternalApi(url: string): Promise<Car[]> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("External cars API failed");
  }
  const payload: unknown = await response.json();
  return parseCarsPayload(payload);
}

/**
 * Список автомобилей. Сейчас: локальный JSON + Zod.
 * TODO: при появлении боевого API — заменить тело на fetch(CARS_API_URL) и тот же parseCarsPayload (или согласовать контракт).
 */
export async function getCars(): Promise<Car[]> {
  const externalUrl = process.env.CARS_API_URL;
  if (externalUrl) {
    return loadCarsFromExternalApi(externalUrl);
  }
  return loadCarsFromFile();
}

/**
 * Одна машина по id. Сейчас: поиск в getCars().
 * TODO: при внешнем API — GET `${CARS_API_URL}/${id}` или отдельный endpoint заказчика.
 */
export async function getCarById(id: string): Promise<Car | null> {
  const cars = await getCars();
  return cars.find((c) => c.id === id) ?? null;
}
