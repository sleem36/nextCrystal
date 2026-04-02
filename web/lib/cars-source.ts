import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { Car } from "@/types/car";

const carSchema = z.object({
  id: z.string(),
  brand: z.string(),
  model: z.string(),
  year: z.number(),
  mileageKm: z.number(),
  priceRub: z.number(),
  monthlyPaymentRub: z.number(),
  bodyType: z.enum(["sedan", "liftback", "suv", "hatchback"]),
  cities: z.array(z.string()),
  trustPoints: z.array(z.string()),
  tags: z.array(z.enum(["family", "first-car", "city", "comfort"])),
});

const carsSchema = z.array(carSchema);

async function loadCarsFromFile(): Promise<Car[]> {
  const filePath = join(process.cwd(), "data", "cars-real.json");
  const file = await readFile(filePath, "utf-8");
  const parsed = JSON.parse(file);
  return carsSchema.parse(parsed);
}

async function loadCarsFromExternalApi(url: string): Promise<Car[]> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("External cars API failed");
  }
  const payload = await response.json();
  return carsSchema.parse(payload);
}

export async function getCars(): Promise<Car[]> {
  const externalUrl = process.env.CARS_API_URL;
  if (externalUrl) {
    return loadCarsFromExternalApi(externalUrl);
  }
  return loadCarsFromFile();
}
