/**
 * Скачивает фото автомобилей.
 *
 * 1) Если задан `UNSPLASH_ACCESS_KEY` — Unsplash Search API (предпочтительно).
 * 2) Иначе — fallback: LoremFlickr (без ключа; теги car/vehicle, `lock` от slug авто).
 *
 * Ключ можно положить в `.env.local` в корне `web/`.
 *
 * Запуск из каталога `web/`: npm run download:images
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const DATA_PATH = join(ROOT, "data", "cars-real.json");
const OUT_DIR = join(ROOT, "public", "images", "cars");
const MANIFEST_PATH = join(ROOT, "lib", "car-images-manifest.json");
const MAX_PER_CAR = 4;
const REQUEST_GAP_MS = 1200;

type CarRow = {
  id: string;
  brand: string;
  model: string;
  year: number;
};

type UnsplashSearchResult = {
  results?: Array<{ urls?: { regular?: string; small?: string } }>;
};

function loadDotEnvLocal() {
  const p = join(ROOT, ".env.local");
  if (!existsSync(p)) return;
  const raw = readFileSync(p, "utf-8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

function readCars(): CarRow[] {
  const raw = readFileSync(DATA_PATH, "utf-8");
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error(`Ожидался массив в ${DATA_PATH}`);
  }
  return data.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: String(r.id),
      brand: String(r.brand),
      model: String(r.model),
      year: Number(r.year),
    };
  });
}

function fileExistsForPublicPath(publicPath: string): boolean {
  const rel = publicPath.replace(/^\//, "");
  return existsSync(join(ROOT, "public", rel));
}

function readManifest(): Record<string, string[]> {
  if (!existsSync(MANIFEST_PATH)) return {};
  try {
    const m: unknown = JSON.parse(readFileSync(MANIFEST_PATH, "utf-8"));
    return typeof m === "object" && m !== null && !Array.isArray(m) ? (m as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

const IMAGE_EXTS = ["jpg", "jpeg", "webp", "png"] as const;

function buildPathsFromDisk(id: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < MAX_PER_CAR; i += 1) {
    for (const ext of IMAGE_EXTS) {
      const p = `/images/cars/${id}-${i}.${ext}`;
      if (fileExistsForPublicPath(p)) {
        out.push(p);
        break;
      }
    }
  }
  return out;
}

function writeManifest(manifest: Record<string, string[]>) {
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");
}

async function downloadToFile(url: string, destFsPath: string): Promise<boolean> {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent":
        "NextCrystal-download-car-images/1.0 (local asset script; contact site owner)",
      Accept: "image/*,*/*",
    },
  });
  if (!res.ok) {
    return false;
  }
  try {
    const buf = Buffer.from(await res.arrayBuffer());
    mkdirSync(join(destFsPath, ".."), { recursive: true });
    writeFileSync(destFsPath, buf);
    return true;
  } catch {
    return false;
  }
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Без API: стабильные разные кадры по индексу (lock в LoremFlickr). */
function loremFlickrCarImageUrl(car: CarRow, index: number): string {
  const lock = (hashString(`${car.id}:${index}`) % 2_147_000_000) >>> 0;
  return `https://loremflickr.com/960/600/car,vehicle,automobile?lock=${lock}`;
}

async function unsplashSearch(
  accessKey: string,
  query: string,
): Promise<UnsplashSearchResult | null> {
  const u = new URL("https://api.unsplash.com/search/photos");
  u.searchParams.set("query", query);
  u.searchParams.set("per_page", String(MAX_PER_CAR));
  u.searchParams.set("orientation", "landscape");
  const res = await fetch(u.toString(), {
    headers: { Authorization: `Client-ID ${accessKey}` },
  });
  if (!res.ok) {
    console.error(`Unsplash HTTP ${res.status} для запроса «${query}»`);
    return null;
  }
  return (await res.json()) as UnsplashSearchResult;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  loadDotEnvLocal();
  const accessKey = process.env.UNSPLASH_ACCESS_KEY?.trim();
  const useUnsplash = Boolean(accessKey);
  if (!useUnsplash) {
    console.warn(
      "UNSPLASH_ACCESS_KEY не задан — используется fallback LoremFlickr (car/vehicle). Для точного поиска по марке задайте ключ в .env.local.",
    );
  }

  mkdirSync(OUT_DIR, { recursive: true });

  const cars = readCars();
  const manifest: Record<string, string[]> = readManifest();

  for (const car of cars) {
    const existingDisk = buildPathsFromDisk(car.id);
    if (existingDisk.length > 0) {
      manifest[car.id] = existingDisk;
      console.log(`Пропуск (уже на диске): ${car.id}`);
      continue;
    }

    const saved: string[] = [];

    if (useUnsplash) {
      const query = `${car.brand} ${car.model} ${car.year} car exterior`;
      const json = await unsplashSearch(accessKey!, query);
      const results = json?.results ?? [];
      if (results.length === 0) {
        console.warn(`Нет результатов Unsplash: ${car.id} — «${query}»`);
        manifest[car.id] = [];
        await sleep(REQUEST_GAP_MS);
        continue;
      }

      for (let i = 0; i < Math.min(results.length, MAX_PER_CAR); i += 1) {
        const url = results[i]?.urls?.regular ?? results[i]?.urls?.small;
        if (!url) continue;
        const dest = join(OUT_DIR, `${car.id}-${i}.jpg`);
        const ok = await downloadToFile(url, dest);
        if (ok) {
          saved.push(`/images/cars/${car.id}-${i}.jpg`);
          console.log(`OK ${car.id} [${i}] Unsplash`);
        } else {
          console.warn(`Сбой загрузки ${car.id} [${i}]`);
        }
      }
    } else {
      for (let i = 0; i < MAX_PER_CAR; i += 1) {
        const url = loremFlickrCarImageUrl(car, i);
        const dest = join(OUT_DIR, `${car.id}-${i}.jpg`);
        const ok = await downloadToFile(url, dest);
        if (ok) {
          saved.push(`/images/cars/${car.id}-${i}.jpg`);
          console.log(`OK ${car.id} [${i}] LoremFlickr`);
        } else {
          console.warn(`Сбой загрузки ${car.id} [${i}]`);
        }
        await sleep(400);
      }
    }

    manifest[car.id] = saved;
    await sleep(REQUEST_GAP_MS);
  }

  for (const car of cars) {
    const fromDisk = buildPathsFromDisk(car.id);
    if (fromDisk.length > 0) {
      manifest[car.id] = fromDisk;
    }
  }

  writeManifest(manifest);
  console.log(`Манифест записан: ${MANIFEST_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
