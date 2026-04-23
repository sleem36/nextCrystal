import "server-only";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const DB_FILE_PATH = process.env.SQLITE_DB_PATH ?? join(process.cwd(), "data", "app.db");

declare global {
  var __nextCrystalDb: Database.Database | undefined;
}

function ensureSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS filter_pages (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      filter_json TEXT NOT NULL,
      title TEXT,
      description TEXT,
      h1 TEXT,
      bottom_title TEXT,
      bottom_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS faq (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      order_index INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name_imya TEXT NOT NULL,
      name_roditelny TEXT,
      name_datelny TEXT,
      name_vinitelny TEXT,
      name_tvoritelny TEXT,
      name_predlozhny TEXT,
      domain_prefix TEXT,
      contact_address TEXT,
      contact_hours TEXT,
      contact_phone TEXT,
      contact_email TEXT,
      contact_legal_email TEXT,
      contact_yandex_map_url TEXT,
      contact_gallery TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const cityColumns = new Set(
    (db.prepare("PRAGMA table_info(cities)").all() as Array<{ name?: string }>).map((column) => column.name ?? ""),
  );
  const ensureCityColumn = (name: string, typeSql: string) => {
    if (!cityColumns.has(name)) {
      db.exec(`ALTER TABLE cities ADD COLUMN ${name} ${typeSql}`);
      cityColumns.add(name);
    }
  };
  ensureCityColumn("contact_address", "TEXT");
  ensureCityColumn("contact_hours", "TEXT");
  ensureCityColumn("contact_phone", "TEXT");
  ensureCityColumn("contact_email", "TEXT");
  ensureCityColumn("contact_legal_email", "TEXT");
  ensureCityColumn("contact_yandex_map_url", "TEXT");
  ensureCityColumn("contact_gallery", "TEXT");
}

export function getDb() {
  if (!globalThis.__nextCrystalDb) {
    mkdirSync(dirname(DB_FILE_PATH), { recursive: true });
    const db = new Database(DB_FILE_PATH);
    ensureSchema(db);
    globalThis.__nextCrystalDb = db;
  }
  // В dev-процессе объект БД может переживать hot-reload, поэтому
  // гарантируем, что ALTER TABLE для новых колонок выполнен и на повторных вызовах.
  ensureSchema(globalThis.__nextCrystalDb);
  return globalThis.__nextCrystalDb;
}
