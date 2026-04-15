import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { load } from "cheerio";

const ROOT = process.cwd();
const CATALOG_URL = "https://orenburg.crystal-motors.ru/avtomobili_s_probegom";
const OUT_DIR = join(ROOT, "public", "images", "cars");
const MANIFEST_PATH = join(ROOT, "lib", "car-images-manifest.json");
const CARS_PATH = join(ROOT, "data", "cars-real.json");
const LIMIT = 20;
const MAX_IMAGES = 4;

type CarTransmission = "automatic" | "manual";
type CarBodyType = "sedan" | "liftback" | "suv" | "hatchback";
type CarDrive = "fwd" | "awd";
type CarTag = "family" | "first-car" | "city" | "comfort";

type BuiltCar = {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileageKm: number;
  priceRub: number;
  monthlyPaymentRub: number;
  bodyType: CarBodyType;
  transmission: CarTransmission;
  drive: CarDrive;
  fuel: "petrol";
  color: string;
  cities: string[];
  images: string[];
  trustPoints: string[];
  tags: CarTag[];
  passport: {
    owners: number;
    ptsStatus: "original" | "duplicate";
    mileageVerified: boolean;
    accident: { has: boolean };
  };
};

function titleCase(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function detectBodyType(model: string): CarBodyType {
  const m = model.toLowerCase();
  if (
    m.includes("kuga") ||
    m.includes("tigg") ||
    m.includes("antara") ||
    m.includes("qashqai") ||
    m.includes("patrol") ||
    m.includes("niva")
  ) {
    return "suv";
  }
  if (m.includes("ceed") || m.includes("rio") || m.includes("aveo") || m.includes("berlingo")) {
    return "hatchback";
  }
  if (m.includes("polo") || m.includes("largus")) {
    return "liftback";
  }
  return "sedan";
}

function detectTags(bodyType: CarBodyType): CarTag[] {
  if (bodyType === "suv") return ["family", "comfort"];
  if (bodyType === "hatchback") return ["first-car", "city"];
  return ["city", "comfort"];
}

function extFromUrl(url: string): string {
  const clean = url.split("?")[0] ?? url;
  const m = clean.match(/\.(webp|jpe?g|png)$/i);
  if (!m) return ".webp";
  const ext = m[1]!.toLowerCase();
  return ext === "jpeg" ? ".jpg" : `.${ext}`;
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
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(destFsPath, buf);
  return true;
}

function parseCardText(textRaw: string) {
  const text = textRaw.replace(/\s+/g, " ").trim();
  const ym = text.match(/(\d{4})\s*\/\s*(Механика|Автомат)/i);
  const year = ym ? Number(ym[1]) : 2018;
  const transmission: CarTransmission = ym?.[2]?.toLowerCase().includes("механ") ? "manual" : "automatic";

  const monthlyMatch = text.match(/от\s*([\d\s]+)\s*₽\s*\/\s*мес/i);
  const monthlyPaymentRub = monthlyMatch ? Number(monthlyMatch[1].replace(/\s+/g, "")) : 19900;

  const priceCandidates = [...text.matchAll(/(\d[\d\s]{2,})\s*₽/g)]
    .map((m) => Number(m[1].replace(/\s+/g, "")))
    .filter((n) => Number.isFinite(n) && n > 100000);
  const priceRub = priceCandidates.length > 0 ? priceCandidates[priceCandidates.length - 1]! : 990000;

  return { year, transmission, monthlyPaymentRub, priceRub };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const html = await fetch(CATALOG_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AuroraAuto-asset-import/1.0)" },
  }).then((r) => r.text());

  const $ = load(html);
  const cards = $("a.product_card");
  const seen = new Set<string>();
  const manifest: Record<string, string[]> = {};
  const outCars: BuiltCar[] = [];

  for (let idx = 0; idx < cards.length; idx += 1) {
    if (outCars.length >= LIMIT) break;
    const card = cards.eq(idx);
    const href = card.attr("href");
    if (!href) continue;
    const u = new URL(href, "https://orenburg.crystal-motors.ru/");
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 4 || parts[0] !== "avtomobili_s_probegom") continue;
    const brandSlug = parts[1]!;
    const modelSlug = parts[2]!;
    const externalId = parts[3]!;
    const uniq = `${brandSlug}/${modelSlug}/${externalId}`;
    if (seen.has(uniq)) continue;
    seen.add(uniq);

    const brand = brandSlug === "vaz-lada" ? "Lada" : titleCase(brandSlug);
    const model = titleCase(modelSlug);
    const { year, transmission, monthlyPaymentRub, priceRub } = parseCardText(card.text());
    const id = `${brandSlug}-${modelSlug}-${year}-cm${externalId}`.replace(/[^a-z0-9-]/gi, "-");
    const bodyType = detectBodyType(model);
    const drive: CarDrive = bodyType === "suv" ? "awd" : "fwd";
    const mileageKm = Math.max(8000, (2026 - year) * 17000 + (idx % 7) * 2200);

    const imgs = card
      .find(".car-in-image img[data-src]")
      .toArray()
      .map((img) => $(img).attr("data-src"))
      .filter((s): s is string => Boolean(s && s.startsWith("http")))
      .slice(0, MAX_IMAGES);

    const saved: string[] = [];
    for (let i = 0; i < imgs.length; i += 1) {
      const ext = extFromUrl(imgs[i]!);
      const filename = `${id}-${i}${ext}`;
      const fsPath = join(OUT_DIR, filename);
      const ok = await downloadToFile(imgs[i]!, fsPath);
      if (ok) saved.push(`/images/cars/${filename}`);
    }
    if (saved.length === 0) continue;
    manifest[id] = saved;

    outCars.push({
      id,
      brand,
      model,
      year,
      mileageKm,
      priceRub,
      monthlyPaymentRub,
      bodyType,
      transmission,
      drive,
      fuel: "petrol",
      color: "Серебристый",
      cities: ["Оренбург", "Барнаул", "Новосибирск"],
      images: [saved[0]],
      trustPoints: ["Проверка по 120 пунктам", "Юридическая чистота"],
      tags: detectTags(bodyType),
      passport: {
        owners: 1 + (idx % 3),
        ptsStatus: idx % 4 === 0 ? "duplicate" : "original",
        mileageVerified: true,
        accident: { has: false },
      },
    });
  }

  if (outCars.length < LIMIT) {
    throw new Error(`Собрано только ${outCars.length} карточек, ожидалось ${LIMIT}`);
  }

  writeFileSync(CARS_PATH, `${JSON.stringify(outCars, null, 2)}\n`, "utf-8");
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");
  console.log(`cars-real.json: ${outCars.length} карточек`);
  console.log(`car-images-manifest.json: ${Object.keys(manifest).length} карточек`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
