/**
 * Парсит карточки каталога Crystal Motors (Оренбург) и скачивает фото с content-auto.ru
 * в public/images/cars/{slug}-{n}.webp|jpg, обновляет lib/car-images-manifest.json.
 *
 * Источник HTML: страница списка (первая порция карточек; «Загрузить ещё» в JS не вызываем).
 * Сопоставление с cars-real.json: по slug бренда/модели в URL (с алиасами Lada→vaz-lada, VW→volkswagen).
 *
 * Запуск из web/: npm run scrape:car-images
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { load } from "cheerio";

const ROOT = process.cwd();
const CATALOG_URL = "https://orenburg.crystal-motors.ru/avtomobili_s_probegom";
const DATA_PATH = join(ROOT, "data", "cars-real.json");
const OUT_DIR = join(ROOT, "public", "images", "cars");
const MANIFEST_PATH = join(ROOT, "lib", "car-images-manifest.json");
const PLACEHOLDER = "/images/cars/placeholder.svg";
const MAX_IMAGES = 4;

type CarRow = { id: string; brand: string; model: string; year: number };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

/** Варианты ключа brand/model как в URL каталога */
function candidateKeys(brand: string, model: string): string[] {
  const b = slugify(brand);
  const m = slugify(model);
  const out = new Set<string>();
  out.add(`${b}/${m}`);
  if (b === "lada") {
    out.add(`vaz-lada/${m}`);
  }
  if (b === "vw") {
    out.add(`volkswagen/${m}`);
  }
  if (brand.toLowerCase() === "volkswagen") {
    out.add(`volkswagen/${m}`);
  }
  if (b === "toyota" && m.replace(/-/g, "") === "rav4") {
    out.add("toyota/rav4");
  }
  if (b === "nissan" && (m === "x-trail" || m === "xtrail")) {
    out.add("nissan/x-trail");
    out.add("nissan/xtrail");
  }
  if (b === "kia" && m === "ceed") {
    out.add("kia/ceed");
  }
  return [...out];
}

function extFromUrl(url: string): string {
  const clean = url.split("?")[0] ?? url;
  const m = clean.match(/\.(webp|jpe?g|png)$/i);
  if (m) return `.${m[1]!.toLowerCase().replace("jpeg", "jpg")}`;
  return ".webp";
}

async function downloadToFile(url: string, destFsPath: string): Promise<boolean> {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; AuroraAuto-asset-import/1.0)",
      Accept: "image/webp,image/*,*/*",
      Referer: "https://orenburg.crystal-motors.ru/",
    },
  });
  if (!res.ok) return false;
  try {
    const buf = Buffer.from(await res.arrayBuffer());
    mkdirSync(join(destFsPath, ".."), { recursive: true });
    writeFileSync(destFsPath, buf);
    return true;
  } catch {
    return false;
  }
}

function readCars(): CarRow[] {
  const raw = readFileSync(DATA_PATH, "utf-8");
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error("cars-real.json: ожидался массив");
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

function parseCatalog(html: string): Map<string, string[]> {
  const $ = load(html);
  const map = new Map<string, string[]>();
  $("a.product_card").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    let pathname: string;
    try {
      pathname = new URL(href, "https://orenburg.crystal-motors.ru/").pathname;
    } catch {
      return;
    }
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length < 4 || parts[0] !== "avtomobili_s_probegom") return;
    const brandSlug = parts[1];
    const modelSlug = parts[2];
    const key = `${brandSlug}/${modelSlug}`;
    if (map.has(key)) return;
    const imgs: string[] = [];
    $(el)
      .find(".car-in-image img[data-src]")
      .each((__, img) => {
        const ds = $(img).attr("data-src");
        if (ds?.startsWith("http")) imgs.push(ds);
      });
    if (imgs.length) map.set(key, imgs);
  });
  return map;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log(`GET ${CATALOG_URL}`);
  const res = await fetch(CATALOG_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AuroraAuto-asset-import/1.0)" },
  });
  if (!res.ok) {
    console.error(`Ошибка HTTP ${res.status}`);
    process.exit(1);
  }
  const html = await res.text();
  const bySlug = parseCatalog(html);
  console.log(`Разобрано уникальных карточек (brand/model): ${bySlug.size}`);

  const cars = readCars();
  mkdirSync(OUT_DIR, { recursive: true });

  const manifest: Record<string, string[]> = {};

  for (const car of cars) {
    const keys = candidateKeys(car.brand, car.model);
    let urls: string[] | undefined;
    for (const k of keys) {
      const u = bySlug.get(k);
      if (u?.length) {
        urls = u;
        console.log(`Сопоставление: ${car.id} ← ${k} (${urls.length} фото)`);
        break;
      }
    }
    if (!urls?.length) {
      console.warn(`Нет карточки на странице для ${car.brand} ${car.model} (${car.id}) — заглушка`);
      manifest[car.id] = [PLACEHOLDER];
      continue;
    }

    const saved: string[] = [];
    const slice = urls.slice(0, MAX_IMAGES);
    for (let i = 0; i < slice.length; i += 1) {
      const url = slice[i]!;
      const ext = extFromUrl(url);
      const dest = join(OUT_DIR, `${car.id}-${i}${ext}`);
      const publicPath = `/images/cars/${car.id}-${i}${ext}`;
      const ok = await downloadToFile(url, dest);
      if (ok) {
        saved.push(publicPath);
        console.log(`  OK ${publicPath}`);
      } else {
        console.warn(`  Сбой загрузки ${url}`);
      }
      await sleep(350);
    }
    manifest[car.id] = saved.length > 0 ? saved : [PLACEHOLDER];
  }

  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");
  console.log(`Манифест: ${MANIFEST_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
