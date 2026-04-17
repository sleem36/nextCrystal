import "server-only";
import { getPgSql, usePostgres } from "@/lib/db-runtime";
import { getDb } from "@/lib/filter-pages-db";
import type { City } from "@/lib/types";

export type { City } from "@/lib/types";

const COLUMNS = `
  id, slug, name_imya, name_roditelny, name_datelny, name_vinitelny, name_tvoritelny, name_predlozhny,
  domain_prefix, is_active, created_at
`;

function normalizeNullableText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function mapCity(row: Record<string, unknown>): City {
  return {
    id: Number(row.id),
    slug: String(row.slug ?? ""),
    name_imya: String(row.name_imya ?? ""),
    name_roditelny: row.name_roditelny ? String(row.name_roditelny) : null,
    name_datelny: row.name_datelny ? String(row.name_datelny) : null,
    name_vinitelny: row.name_vinitelny ? String(row.name_vinitelny) : null,
    name_tvoritelny: row.name_tvoritelny ? String(row.name_tvoritelny) : null,
    name_predlozhny: row.name_predlozhny ? String(row.name_predlozhny) : null,
    domain_prefix: row.domain_prefix ? String(row.domain_prefix) : null,
    is_active: Number(row.is_active ?? 0),
    created_at: String(row.created_at ?? ""),
  };
}

export async function getAllCities(onlyActive = false): Promise<City[]> {
  if (usePostgres()) {
    const sql = await getPgSql();
    const rows = await sql<City[]>`
      SELECT
        id::int as id,
        slug,
        name_imya,
        name_roditelny,
        name_datelny,
        name_vinitelny,
        name_tvoritelny,
        name_predlozhny,
        domain_prefix,
        is_active::int as is_active,
        created_at::text as created_at
      FROM cities
      ${onlyActive ? sql`WHERE is_active = 1` : sql``}
      ORDER BY name_imya ASC, id ASC
    `;
    return rows;
  }

  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT ${COLUMNS}
        FROM cities
        ${onlyActive ? "WHERE is_active = 1" : ""}
        ORDER BY name_imya ASC, id ASC
      `,
    )
    .all() as Record<string, unknown>[];
  return rows.map(mapCity);
}

export async function getCityById(id: number): Promise<City | null> {
  if (usePostgres()) {
    const sql = await getPgSql();
    const rows = await sql<City[]>`
      SELECT
        id::int as id,
        slug,
        name_imya,
        name_roditelny,
        name_datelny,
        name_vinitelny,
        name_tvoritelny,
        name_predlozhny,
        domain_prefix,
        is_active::int as is_active,
        created_at::text as created_at
      FROM cities
      WHERE id = ${id}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  const db = getDb();
  const row = db
    .prepare(
      `
        SELECT ${COLUMNS}
        FROM cities
        WHERE id = ?
        LIMIT 1
      `,
    )
    .get(id) as Record<string, unknown> | undefined;
  return row ? mapCity(row) : null;
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  if (usePostgres()) {
    const sql = await getPgSql();
    const rows = await sql<City[]>`
      SELECT
        id::int as id,
        slug,
        name_imya,
        name_roditelny,
        name_datelny,
        name_vinitelny,
        name_tvoritelny,
        name_predlozhny,
        domain_prefix,
        is_active::int as is_active,
        created_at::text as created_at
      FROM cities
      WHERE slug = ${slug}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  const db = getDb();
  const row = db
    .prepare(
      `
        SELECT ${COLUMNS}
        FROM cities
        WHERE slug = ?
        LIMIT 1
      `,
    )
    .get(slug) as Record<string, unknown> | undefined;
  return row ? mapCity(row) : null;
}

export async function createCity(data: Omit<City, "id" | "created_at">): Promise<void> {
  if (usePostgres()) {
    const sql = await getPgSql();
    await sql`
      INSERT INTO cities (
        slug, name_imya, name_roditelny, name_datelny, name_vinitelny, name_tvoritelny, name_predlozhny,
        domain_prefix, is_active, created_at
      ) VALUES (
        ${data.slug.trim()},
        ${data.name_imya.trim()},
        ${normalizeNullableText(data.name_roditelny)},
        ${normalizeNullableText(data.name_datelny)},
        ${normalizeNullableText(data.name_vinitelny)},
        ${normalizeNullableText(data.name_tvoritelny)},
        ${normalizeNullableText(data.name_predlozhny)},
        ${normalizeNullableText(data.domain_prefix)},
        ${data.is_active ? 1 : 0},
        NOW()
      )
    `;
    return;
  }

  const db = getDb();
  db.prepare(
    `
      INSERT INTO cities (
        slug, name_imya, name_roditelny, name_datelny, name_vinitelny, name_tvoritelny, name_predlozhny,
        domain_prefix, is_active, created_at
      ) VALUES (
        @slug, @name_imya, @name_roditelny, @name_datelny, @name_vinitelny, @name_tvoritelny, @name_predlozhny,
        @domain_prefix, @is_active, CURRENT_TIMESTAMP
      )
    `,
  ).run({
    slug: data.slug.trim(),
    name_imya: data.name_imya.trim(),
    name_roditelny: normalizeNullableText(data.name_roditelny),
    name_datelny: normalizeNullableText(data.name_datelny),
    name_vinitelny: normalizeNullableText(data.name_vinitelny),
    name_tvoritelny: normalizeNullableText(data.name_tvoritelny),
    name_predlozhny: normalizeNullableText(data.name_predlozhny),
    domain_prefix: normalizeNullableText(data.domain_prefix),
    is_active: data.is_active ? 1 : 0,
  });
}

export async function updateCity(id: number, data: Partial<City>): Promise<void> {
  if (usePostgres()) {
    const current = await getCityById(id);
    if (!current) return;
    const sql = await getPgSql();
    await sql`
      UPDATE cities
      SET
        slug = ${(data.slug ?? current.slug).trim()},
        name_imya = ${(data.name_imya ?? current.name_imya).trim()},
        name_roditelny = ${normalizeNullableText(data.name_roditelny ?? current.name_roditelny)},
        name_datelny = ${normalizeNullableText(data.name_datelny ?? current.name_datelny)},
        name_vinitelny = ${normalizeNullableText(data.name_vinitelny ?? current.name_vinitelny)},
        name_tvoritelny = ${normalizeNullableText(data.name_tvoritelny ?? current.name_tvoritelny)},
        name_predlozhny = ${normalizeNullableText(data.name_predlozhny ?? current.name_predlozhny)},
        domain_prefix = ${normalizeNullableText(data.domain_prefix ?? current.domain_prefix)},
        is_active = ${data.is_active ?? current.is_active}
      WHERE id = ${id}
    `;
    return;
  }

  const db = getDb();
  const current = await getCityById(id);
  if (!current) return;
  db.prepare(
    `
      UPDATE cities
      SET
        slug = @slug,
        name_imya = @name_imya,
        name_roditelny = @name_roditelny,
        name_datelny = @name_datelny,
        name_vinitelny = @name_vinitelny,
        name_tvoritelny = @name_tvoritelny,
        name_predlozhny = @name_predlozhny,
        domain_prefix = @domain_prefix,
        is_active = @is_active
      WHERE id = @id
    `,
  ).run({
    id,
    slug: (data.slug ?? current.slug).trim(),
    name_imya: (data.name_imya ?? current.name_imya).trim(),
    name_roditelny: normalizeNullableText(data.name_roditelny ?? current.name_roditelny),
    name_datelny: normalizeNullableText(data.name_datelny ?? current.name_datelny),
    name_vinitelny: normalizeNullableText(data.name_vinitelny ?? current.name_vinitelny),
    name_tvoritelny: normalizeNullableText(data.name_tvoritelny ?? current.name_tvoritelny),
    name_predlozhny: normalizeNullableText(data.name_predlozhny ?? current.name_predlozhny),
    domain_prefix: normalizeNullableText(data.domain_prefix ?? current.domain_prefix),
    is_active: data.is_active ?? current.is_active,
  });
}

export async function deleteCity(id: number): Promise<void> {
  if (usePostgres()) {
    const sql = await getPgSql();
    await sql`DELETE FROM cities WHERE id = ${id}`;
    return;
  }

  const db = getDb();
  db.prepare("DELETE FROM cities WHERE id = ?").run(id);
}
