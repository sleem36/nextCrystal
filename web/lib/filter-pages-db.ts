import "server-only";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { unstable_cache } from "next/cache";
import { getPgSql, usePostgres } from "@/lib/db-runtime";

const DB_FILE_PATH = process.env.SQLITE_DB_PATH ?? join(process.cwd(), "data", "app.db");

export const FILTER_PAGES_CACHE_TAG = "filter-pages";

export type FilterPageRecord = {
  slug: string;
  name: string;
  filter_json: string;
  title: string | null;
  description: string | null;
  h1: string | null;
  bottom_title: string | null;
  bottom_text: string | null;
  created_at: string;
  updated_at: string;
};

export type FilterPageUpsertInput = {
  slug: string;
  name: string;
  filter_json: string;
  title?: string | null;
  description?: string | null;
  h1?: string | null;
  bottom_title?: string | null;
  bottom_text?: string | null;
};

declare global {
  // eslint-disable-next-line no-var
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
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function getDb() {
  if (!globalThis.__nextCrystalDb) {
    mkdirSync(dirname(DB_FILE_PATH), { recursive: true });
    const db = new Database(DB_FILE_PATH);
    ensureSchema(db);
    globalThis.__nextCrystalDb = db;
  }

  return globalThis.__nextCrystalDb;
}

function normalizeNullableText(value: string | null | undefined) {
  const nextValue = value?.trim();
  return nextValue ? nextValue : null;
}

const getAllFilterPagesCached = unstable_cache(
  async (): Promise<FilterPageRecord[]> => {
    if (usePostgres()) {
      const sql = await getPgSql();
      const rows = await sql<FilterPageRecord[]>`
        SELECT
          slug,
          name,
          filter_json,
          title,
          description,
          h1,
          bottom_title,
          bottom_text,
          created_at::text as created_at,
          updated_at::text as updated_at
        FROM filter_pages
        ORDER BY updated_at DESC, created_at DESC
      `;
      return rows;
    }

    const db = getDb();
    return db
      .prepare(
        `
          SELECT slug, name, filter_json, title, description, h1, bottom_title, bottom_text, created_at, updated_at
          FROM filter_pages
          ORDER BY updated_at DESC, created_at DESC
        `,
      )
      .all() as FilterPageRecord[];
  },
  ["filter-pages-all"],
  { tags: [FILTER_PAGES_CACHE_TAG] },
);

export async function getAllFilterPages() {
  return getAllFilterPagesCached();
}

export async function getFilterPageBySlug(slug: string): Promise<FilterPageRecord | null> {
  if (usePostgres()) {
    const sql = await getPgSql();
    const rows = await sql<FilterPageRecord[]>`
      SELECT
        slug,
        name,
        filter_json,
        title,
        description,
        h1,
        bottom_title,
        bottom_text,
        created_at::text as created_at,
        updated_at::text as updated_at
      FROM filter_pages
      WHERE slug = ${slug}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  const db = getDb();
  const row = db
    .prepare(
      `
        SELECT slug, name, filter_json, title, description, h1, bottom_title, bottom_text, created_at, updated_at
        FROM filter_pages
        WHERE slug = ?
        LIMIT 1
      `,
    )
    .get(slug) as FilterPageRecord | undefined;
  return row ?? null;
}

export async function createFilterPage(data: FilterPageUpsertInput) {
  if (usePostgres()) {
    const sql = await getPgSql();
    await sql`
      INSERT INTO filter_pages (
        slug, name, filter_json, title, description, h1, bottom_title, bottom_text, created_at, updated_at
      ) VALUES (
        ${data.slug},
        ${data.name.trim()},
        ${data.filter_json},
        ${normalizeNullableText(data.title)},
        ${normalizeNullableText(data.description)},
        ${normalizeNullableText(data.h1)},
        ${normalizeNullableText(data.bottom_title)},
        ${normalizeNullableText(data.bottom_text)},
        NOW(),
        NOW()
      )
    `;
    return;
  }

  const db = getDb();
  db.prepare(
    `
      INSERT INTO filter_pages (
        slug, name, filter_json, title, description, h1, bottom_title, bottom_text, created_at, updated_at
      ) VALUES (
        @slug, @name, @filter_json, @title, @description, @h1, @bottom_title, @bottom_text, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `,
  ).run({
    slug: data.slug,
    name: data.name.trim(),
    filter_json: data.filter_json,
    title: normalizeNullableText(data.title),
    description: normalizeNullableText(data.description),
    h1: normalizeNullableText(data.h1),
    bottom_title: normalizeNullableText(data.bottom_title),
    bottom_text: normalizeNullableText(data.bottom_text),
  });
}

export async function updateFilterPage(slug: string, data: Omit<FilterPageUpsertInput, "slug">) {
  if (usePostgres()) {
    const sql = await getPgSql();
    await sql`
      UPDATE filter_pages
      SET
        name = ${data.name.trim()},
        filter_json = ${data.filter_json},
        title = ${normalizeNullableText(data.title)},
        description = ${normalizeNullableText(data.description)},
        h1 = ${normalizeNullableText(data.h1)},
        bottom_title = ${normalizeNullableText(data.bottom_title)},
        bottom_text = ${normalizeNullableText(data.bottom_text)},
        updated_at = NOW()
      WHERE slug = ${slug}
    `;
    return;
  }

  const db = getDb();
  db.prepare(
    `
      UPDATE filter_pages
      SET
        name = @name,
        filter_json = @filter_json,
        title = @title,
        description = @description,
        h1 = @h1,
        bottom_title = @bottom_title,
        bottom_text = @bottom_text,
        updated_at = CURRENT_TIMESTAMP
      WHERE slug = @slug
    `,
  ).run({
    slug,
    name: data.name.trim(),
    filter_json: data.filter_json,
    title: normalizeNullableText(data.title),
    description: normalizeNullableText(data.description),
    h1: normalizeNullableText(data.h1),
    bottom_title: normalizeNullableText(data.bottom_title),
    bottom_text: normalizeNullableText(data.bottom_text),
  });
}

export async function deleteFilterPage(slug: string) {
  if (usePostgres()) {
    const sql = await getPgSql();
    await sql`DELETE FROM filter_pages WHERE slug = ${slug}`;
    return;
  }

  const db = getDb();
  db.prepare("DELETE FROM filter_pages WHERE slug = ?").run(slug);
}
