import "server-only";
import postgres, { type Sql } from "postgres";

let sqlClient: Sql | null = null;
let ensureSchemaPromise: Promise<void> | null = null;

function getPostgresUrl() {
  return process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim() || "";
}

/** Наличие строки подключения Postgres (не React Hook — имя без префикса `use`). */
export function isPostgresConfigured() {
  return Boolean(getPostgresUrl());
}

/** Backward-compatible alias for repositories using legacy naming. */
export const isPostgresEnabled = isPostgresConfigured;

function getSql() {
  if (!sqlClient) {
    const url = getPostgresUrl();
    if (!url) {
      throw new Error("Postgres URL is not configured");
    }
    sqlClient = postgres(url, { ssl: "require", prepare: false });
  }
  return sqlClient;
}

export async function ensurePostgresSchema() {
  if (!isPostgresConfigured()) return;
  if (!ensureSchemaPromise) {
    ensureSchemaPromise = (async () => {
      const sql = getSql();
      await sql`
        CREATE TABLE IF NOT EXISTS filter_pages (
          slug TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          filter_json TEXT NOT NULL,
          title TEXT,
          description TEXT,
          h1 TEXT,
          bottom_title TEXT,
          bottom_text TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS faq (
          id BIGSERIAL PRIMARY KEY,
          question TEXT NOT NULL,
          answer TEXT NOT NULL,
          order_index INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS cities (
          id BIGSERIAL PRIMARY KEY,
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
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`ALTER TABLE cities ADD COLUMN IF NOT EXISTS contact_address TEXT`;
      await sql`ALTER TABLE cities ADD COLUMN IF NOT EXISTS contact_hours TEXT`;
      await sql`ALTER TABLE cities ADD COLUMN IF NOT EXISTS contact_phone TEXT`;
      await sql`ALTER TABLE cities ADD COLUMN IF NOT EXISTS contact_email TEXT`;
      await sql`ALTER TABLE cities ADD COLUMN IF NOT EXISTS contact_legal_email TEXT`;
      await sql`ALTER TABLE cities ADD COLUMN IF NOT EXISTS contact_yandex_map_url TEXT`;
      await sql`ALTER TABLE cities ADD COLUMN IF NOT EXISTS contact_gallery TEXT`;
    })();
  }
  await ensureSchemaPromise;
}

export async function getPgSql() {
  await ensurePostgresSchema();
  return getSql();
}
