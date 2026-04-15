/**
 * Без сети: заполняет lib/car-images-manifest.json путями к локальной заглушке.
 * Полноценные фото: npm run download:images при доступном UNSPLASH_ACCESS_KEY или сети до LoremFlickr.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data", "cars-real.json");
const MANIFEST = path.join(ROOT, "lib", "car-images-manifest.json");
const PLACEHOLDER = "/images/cars/placeholder.svg";

const raw = fs.readFileSync(DATA, "utf8");
const cars = JSON.parse(raw);
if (!Array.isArray(cars)) throw new Error("cars-real.json: ожидался массив");

const manifest = {};
for (const c of cars) {
  const id = String(c.id);
  manifest[id] = [PLACEHOLDER];
}
fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Записано ${Object.keys(manifest).length} записей → ${MANIFEST}`);
