import Database from "better-sqlite3";
import path from "node:path";

const dbPath = path.join(process.cwd(), "data", "app.db");
const db = new Database(dbPath);

function buildYandexMapWidgetUrl(lat, lng, zoom = 16) {
  const ll = `${lng},${lat}`;
  const pt = `${lng},${lat},pm2rdm`;
  return `https://yandex.ru/map-widget/v1/?ll=${encodeURIComponent(ll)}&z=${zoom}&l=map&pt=${encodeURIComponent(pt)}`;
}

function storesPhotos(storeId, indices) {
  return indices.map((n) => `https://orenburg.crystal-motors.ru/media/stores/${storeId}_${n}.png`);
}

const cityMeta = [
  { city: "Екатеринбург", lat: 56.842192, lng: 60.58824, storeId: 0, indices: [1, 2, 3] },
  { city: "Челябинск", lat: 55.117504, lng: 61.360719, storeId: 1, indices: [1, 2, 3, 4, 5] },
  { city: "Тюмень", lat: 57.108741, lng: 65.643814, storeId: 2, indices: [1, 2, 3] },
  { city: "Томск", lat: 56.525792, lng: 84.98845, storeId: 4, indices: [1, 3, 4, 5, 6] },
  { city: "Омск", lat: 54.97658819853188, lng: 73.33811667594908, storeId: 7, indices: [1, 2, 3, 4, 5] },
  { city: "Красноярск", lat: 56.047208, lng: 92.885423, storeId: 9, indices: [1, 2, 3, 4, 5] },
  { city: "Сургут", lat: 61.271545, lng: 73.428354, storeId: 10, indices: [1, 2, 3, 4, 5] },
  { city: "Новосибирск", lat: 54.983696, lng: 82.999077, storeId: 11, indices: [1, 2, 3] },
  { city: "Новокузнецк", lat: 53.774382, lng: 87.276603, storeId: 12, indices: [1, 2, 3, 4, 5] },
  { city: "Кемерово", lat: 55.30663, lng: 86.14107, storeId: 14, indices: [1, 2, 3, 4, 5] },
  { city: "Барнаул", lat: 53.314767, lng: 83.833334, storeId: 15, indices: [1, 2, 3, 4, 5] },
  { city: "Пермь", lat: 58.034077, lng: 56.200976, storeId: 18, indices: [1, 2, 3] },
  { city: "Оренбург", lat: 51.841058, lng: 55.162631, storeId: 22, indices: [1, 2, 3] },
];

const update = db.prepare(`
  UPDATE cities
  SET
    contact_yandex_map_url = ?,
    contact_gallery = ?
  WHERE name_imya = ?
`);

const tx = db.transaction(() => {
  let updated = 0;
  for (const item of cityMeta) {
    const mapUrl = buildYandexMapWidgetUrl(item.lat, item.lng);
    const gallery = storesPhotos(item.storeId, item.indices).join("\n");
    const info = update.run(mapUrl, gallery, item.city);
    updated += Number(info.changes || 0);
  }
  return updated;
});

const updated = tx();
console.log(`Updated rows: ${updated}`);

const preview = db
  .prepare(`
    SELECT id, name_imya, contact_yandex_map_url, substr(contact_gallery, 1, 120) AS gallery_preview
    FROM cities
    ORDER BY id ASC
  `)
  .all();

console.log(JSON.stringify(preview, null, 2));
