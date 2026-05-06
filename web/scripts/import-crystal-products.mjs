import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import { z } from "zod";

const SOURCE_URL = "https://crystal-motors.ru/method.getProducts?count=10000";

// Mirror app schema (web/lib/cars-source.ts) to validate output.
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

const carSchema = z.object({
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
  images: z
    .array(
      z
        .string()
        .min(1)
        .refine(
          (s) => s.startsWith("/") || /^https?:\/\//i.test(s),
          "Expected absolute URL or root-relative path",
        ),
    )
    .min(1),
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
  engineVolumeL: z.number().positive().optional(),
  doorCount: z.number().int().min(2).max(5).optional(),
  powerHp: z.number().int().positive().optional(),
  steeringWheel: z.string().min(1).optional(),
  vin: z.string().min(1).optional(),
  trim: z.string().min(1).optional(),
});

const carsArraySchema = z.array(carSchema);

function firstValue(feature) {
  const v = feature?.values?.[0];
  return v == null ? null : v;
}

function asNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function normalizeFuel(raw) {
  const s = String(raw || "").toLowerCase();
  if (s.includes("диз")) return "diesel";
  if (s.includes("гиб")) return "hybrid";
  return "petrol";
}

function normalizeTransmission(raw) {
  const s = String(raw || "").toLowerCase();
  if (s.includes("мех")) return "manual";
  return "automatic";
}

function normalizeDrive(raw) {
  const s = String(raw || "").toLowerCase();
  if (s.includes("перед")) return "fwd";
  if (s.includes("задн")) return "rwd";
  return "awd";
}

function normalizeBodyType(raw) {
  const s = String(raw || "").toLowerCase();
  if (s.includes("лифт")) return "liftback";
  if (s.includes("хэтч") || s.includes("хетч")) return "hatchback";
  if (s.includes("седан")) return "sedan";
  return "suv";
}

function mapItemToCar(item) {
  const f = item?.features ?? {};
  const year = asNumber(firstValue(f.Year)) ?? null;
  const mileageKm = asNumber(firstValue(f.Kilometrage)) ?? 0;

  const engineVolumeLRaw = asNumber(firstValue(f.EngineSize));
  const engineVolumeL = engineVolumeLRaw != null && engineVolumeLRaw > 0 ? engineVolumeLRaw : null;
  const powerHpRaw = asNumber(firstValue(f.Power));
  const powerHp = powerHpRaw != null && powerHpRaw > 0 ? powerHpRaw : null;
  const vin = firstValue(f.VIN);

  const fuel = normalizeFuel(firstValue(f.FuelType));
  const transmission = normalizeTransmission(firstValue(f.Transmission));
  const drive = normalizeDrive(firstValue(f.DriveType));
  const bodyType = normalizeBodyType(firstValue(f.BodyType));

  const imageObjects = Array.isArray(item?.images) ? item.images : [];
  const images = imageObjects
    .map((img) => img?.big || img?.middle || img?.small)
    .filter((x) => typeof x === "string" && x.length > 0);

  if (!item?.id || !item?.brand || !item?.model || !year || images.length === 0) {
    return null;
  }

  const city = item?.store?.city ? String(item.store.city) : undefined;
  const priceRub = asNumber(item.price);
  const monthlyPaymentRub = asNumber(item.credit) ?? 0;

  if (!priceRub || priceRub <= 0) return null;

  return {
    id: String(item.id),
    brand: String(item.brand),
    model: String(item.model),
    year: Math.trunc(year),
    mileageKm: Math.max(0, Math.trunc(mileageKm || 0)),
    priceRub: Math.round(priceRub),
    monthlyPaymentRub: Math.max(0, Math.round(monthlyPaymentRub)),
    bodyType,
    transmission,
    drive,
    fuel,
    color: "Не указан",
    city: city || undefined,
    cities: city ? [city] : undefined,
    images,
    trustPoints: ["Проверка по 120 пунктам", "Юридическая чистота"],
    tags: [],
    passport: {
      owners: 1,
      ptsStatus: "original",
      mileageVerified: false,
      accident: { has: false },
    },
    ...(engineVolumeL != null ? { engineVolumeL } : {}),
    ...(powerHp != null ? { powerHp: Math.trunc(powerHp) } : {}),
    ...(typeof vin === "string" && vin.trim() ? { vin: vin.trim() } : {}),
  };
}

async function main() {
  const startedAt = Date.now();
  console.log(`Fetching ${SOURCE_URL}`);
  const res = await fetch(SOURCE_URL, { headers: { accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`Source API failed: ${res.status} ${res.statusText}`);
  }
  const payload = await res.json();
  const items = payload?.answer?.items;
  if (!Array.isArray(items)) {
    throw new Error("Unexpected payload shape: expected answer.items[]");
  }

  let ok = 0;
  let skipped = 0;
  const cars = [];

  for (const item of items) {
    const mapped = mapItemToCar(item);
    if (!mapped) {
      skipped += 1;
      continue;
    }
    cars.push(mapped);
    ok += 1;
  }

  // Validate against app schema.
  const parsed = carsArraySchema.safeParse(cars);
  if (!parsed.success) {
    console.error(parsed.error.issues.slice(0, 20));
    throw new Error(`Validation failed: ${parsed.error.issues.length} issues`);
  }

  // Stable output order for diff readability.
  parsed.data.sort((a, b) => a.id.localeCompare(b.id, "en"));

  const outPath = join(process.cwd(), "data", "cars-real.json");
  await writeFile(outPath, `${JSON.stringify(parsed.data, null, 2)}\n`, "utf-8");

  console.log(
    `Done. items=${items.length} ok=${ok} skipped=${skipped} wrote=${outPath} in ${Math.round(
      (Date.now() - startedAt) / 1000,
    )}s`,
  );
}

await main();

