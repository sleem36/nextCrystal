import Database from "better-sqlite3";
import path from "node:path";

const dbPath = path.join(process.cwd(), "data", "app.db");
const db = new Database(dbPath);

const legal = "legaldepartment@crystal-motors.ru";

const rows = [
  ["Екатеринбург", "ул. Боевых Дружин, 20", "Ежедневно с 9:00 до 20:00", "+7 (343) 363-03-69", "info@cm66.ru", legal],
  ["Челябинск", "ул. Кузнецова, 1А", "Ежедневно с 9:00 до 20:00", "+7 (351) 220-70-29", "info@cm174.ru", legal],
  ["Тюмень", "ул. Республики, 254к3", "Ежедневно с 09:00 до 20:00", "+7 (345) 257-88-74", "tumen@cm66.ru", legal],
  ["Томск", "ул. Смирнова, 5И", "Ежедневно с 9:00 до 20:00", "+7 (382) 299-01-03", "tomsk@crystal-motors.ru", legal],
  ["Омск", "Енисейская ул., 18/1", "Ежедневно с 9:00 до 20:00", "+7 (381) 221-90-23", "omsk@crystal-motors.ru", legal],
  ["Красноярск", "Караульная ул., 47", "Ежедневно с 9:00 до 20:00", "+7 (391) 986-55-96", "krasnoyarsk@crystal-motors.ru", legal],
  ["Сургут", "Производственная ул., 6", "Ежедневно с 9:00 до 20:00", "+7 (346) 250-02-79", "surgut@crystal-motors.ru", legal],
  ["Новосибирск", "Большевистская ул., 276", "Ежедневно с 9:00 до 20:00", "+7 (383) 388-51-38", "novosib@crystal-motors.ru", legal],
  ["Новокузнецк", "Байдаевское шоссе, 22", "Ежедневно с 9:00 до 20:00", "+7 (384) 334-80-07", "novokuznetsk@crystal-motors.ru", legal],
  ["Кемерово", "ул. Тухачевского, 64", "Ежедневно с 9:00 до 20:00", "+7 (384) 221-59-80", "kemerovo@crystal-motors.ru", legal],
  ["Барнаул", "Правобережный тракт, 26", "Ежедневно с 9:00 до 20:00", "+7 (385) 259-03-06", "barnaul@crystal-motors.ru", legal],
  ["Пермь", "ул. Спешилова, 101А", "Ежедневно с 9:00 до 20:00", "+7 (342) 248-28-50", "perm@crystal-motors.ru", legal],
  ["Оренбург", "Загородное шоссе, 13/7", "Ежедневно с 9:00 до 20:00", "+7 (353) 250-57-15", "orenburg@crystal-motors.ru", legal],
];

const update = db.prepare(`
  UPDATE cities
  SET
    contact_address = ?,
    contact_hours = ?,
    contact_phone = ?,
    contact_email = ?,
    contact_legal_email = ?
  WHERE name_imya = ?
`);

const tx = db.transaction(() => {
  let updated = 0;
  for (const [city, address, hours, phone, email, legalEmail] of rows) {
    const info = update.run(address, hours, phone, email, legalEmail, city);
    updated += Number(info.changes || 0);
  }
  return updated;
});

const updatedCount = tx();
console.log(`Updated rows: ${updatedCount}`);

const preview = db
  .prepare(`
    SELECT id, slug, name_imya, contact_address, contact_hours, contact_phone, contact_email, contact_legal_email
    FROM cities
    ORDER BY id ASC
  `)
  .all();

console.log(JSON.stringify(preview, null, 2));
