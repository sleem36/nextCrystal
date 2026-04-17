import "server-only";
import postgres, { type Sql } from "postgres";

let sqlClient: Sql | null = null;
let ensureSchemaPromise: Promise<void> | null = null;

function getPostgresUrl() {
  return process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim() || "";
}

export function usePostgres() {
  return Boolean(getPostgresUrl());
}

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
  if (!usePostgres()) return;
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
          is_active INTEGER DEFAULT 1,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
    })();
  }
  await ensureSchemaPromise;
}

export async function getPgSql() {
  await ensurePostgresSchema();
  return getSql();
}
