import "server-only";
import { BaseRepository } from "@/lib/base-repository";
import { getPgSql, isPostgresEnabled } from "@/lib/db-runtime";
import type { City } from "@/lib/types";
import { getDb } from "@/lib/sqlite-db";

export type { City } from "@/lib/types";

type CityContactFields = Pick<
  City,
  | "contact_address"
  | "contact_hours"
  | "contact_phone"
  | "contact_email"
  | "contact_legal_email"
  | "contact_yandex_map_url"
  | "contact_gallery"
>;

type CreateCityInput = Omit<City, "id" | "created_at" | keyof CityContactFields> &
  Partial<CityContactFields>;

const COLUMNS = `
  id, slug, name_imya, name_roditelny, name_datelny, name_vinitelny, name_tvoritelny, name_predlozhny,
  domain_prefix, contact_address, contact_hours, contact_phone, contact_email, contact_legal_email,
  contact_yandex_map_url, contact_gallery, is_active, created_at
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
    contact_address: row.contact_address ? String(row.contact_address) : null,
    contact_hours: row.contact_hours ? String(row.contact_hours) : null,
    contact_phone: row.contact_phone ? String(row.contact_phone) : null,
    contact_email: row.contact_email ? String(row.contact_email) : null,
    contact_legal_email: row.contact_legal_email ? String(row.contact_legal_email) : null,
    contact_yandex_map_url: row.contact_yandex_map_url ? String(row.contact_yandex_map_url) : null,
    contact_gallery: row.contact_gallery ? String(row.contact_gallery) : null,
    is_active: Number(row.is_active ?? 0),
    created_at: String(row.created_at ?? ""),
  };
}

const citiesRepository = new BaseRepository<City, number>({
  table: "cities",
  idColumn: "id",
  selectColumns: COLUMNS.split(",").map((item) => item.trim()).filter(Boolean),
  defaultOrderBy: "name_imya ASC, id ASC",
  mapRow: mapCity,
  dbFactory: getDb,
  beforeCreate: (data) => ({
    slug: data.slug.trim(),
    name_imya: data.name_imya.trim(),
    name_roditelny: normalizeNullableText(data.name_roditelny),
    name_datelny: normalizeNullableText(data.name_datelny),
    name_vinitelny: normalizeNullableText(data.name_vinitelny),
    name_tvoritelny: normalizeNullableText(data.name_tvoritelny),
    name_predlozhny: normalizeNullableText(data.name_predlozhny),
    domain_prefix: normalizeNullableText(data.domain_prefix),
    contact_address: normalizeNullableText(data.contact_address),
    contact_hours: normalizeNullableText(data.contact_hours),
    contact_phone: normalizeNullableText(data.contact_phone),
    contact_email: normalizeNullableText(data.contact_email),
    contact_legal_email: normalizeNullableText(data.contact_legal_email),
    contact_yandex_map_url: normalizeNullableText(data.contact_yandex_map_url),
    contact_gallery: normalizeNullableText(data.contact_gallery),
    is_active: data.is_active ? 1 : 0,
  }),
  beforeUpdate: (data) => ({
    ...(data.slug !== undefined ? { slug: data.slug.trim() } : {}),
    ...(data.name_imya !== undefined ? { name_imya: data.name_imya.trim() } : {}),
    ...(data.name_roditelny !== undefined
      ? { name_roditelny: normalizeNullableText(data.name_roditelny) }
      : {}),
    ...(data.name_datelny !== undefined ? { name_datelny: normalizeNullableText(data.name_datelny) } : {}),
    ...(data.name_vinitelny !== undefined ? { name_vinitelny: normalizeNullableText(data.name_vinitelny) } : {}),
    ...(data.name_tvoritelny !== undefined
      ? { name_tvoritelny: normalizeNullableText(data.name_tvoritelny) }
      : {}),
    ...(data.name_predlozhny !== undefined
      ? { name_predlozhny: normalizeNullableText(data.name_predlozhny) }
      : {}),
    ...(data.domain_prefix !== undefined ? { domain_prefix: normalizeNullableText(data.domain_prefix) } : {}),
    ...(data.contact_address !== undefined
      ? { contact_address: normalizeNullableText(data.contact_address) }
      : {}),
    ...(data.contact_hours !== undefined ? { contact_hours: normalizeNullableText(data.contact_hours) } : {}),
    ...(data.contact_phone !== undefined ? { contact_phone: normalizeNullableText(data.contact_phone) } : {}),
    ...(data.contact_email !== undefined ? { contact_email: normalizeNullableText(data.contact_email) } : {}),
    ...(data.contact_legal_email !== undefined
      ? { contact_legal_email: normalizeNullableText(data.contact_legal_email) }
      : {}),
    ...(data.contact_yandex_map_url !== undefined
      ? { contact_yandex_map_url: normalizeNullableText(data.contact_yandex_map_url) }
      : {}),
    ...(data.contact_gallery !== undefined ? { contact_gallery: normalizeNullableText(data.contact_gallery) } : {}),
    ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
  }),
});

export async function getAllCities(onlyActive = false): Promise<City[]> {
  if (isPostgresEnabled()) {
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
        contact_address,
        contact_hours,
        contact_phone,
        contact_email,
        contact_legal_email,
        contact_yandex_map_url,
        contact_gallery,
        is_active::int as is_active,
        created_at::text as created_at
      FROM cities
      ${onlyActive ? sql`WHERE is_active = 1` : sql``}
      ORDER BY name_imya ASC, id ASC
    `;
    return rows;
  }

  if (onlyActive) {
    const rows = getDb()
      .prepare(
        `
          SELECT ${COLUMNS}
          FROM cities
          WHERE is_active = 1
          ORDER BY name_imya ASC, id ASC
        `,
      )
      .all() as Record<string, unknown>[];
    return rows.map(mapCity);
  }
  return citiesRepository.getAll();
}

export async function getCityById(id: number): Promise<City | null> {
  if (isPostgresEnabled()) {
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
        contact_address,
        contact_hours,
        contact_phone,
        contact_email,
        contact_legal_email,
        contact_yandex_map_url,
        contact_gallery,
        is_active::int as is_active,
        created_at::text as created_at
      FROM cities
      WHERE id = ${id}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  return citiesRepository.getById(id);
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  if (isPostgresEnabled()) {
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
        contact_address,
        contact_hours,
        contact_phone,
        contact_email,
        contact_legal_email,
        contact_yandex_map_url,
        contact_gallery,
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

export async function createCity(data: CreateCityInput): Promise<void> {
  const withDefaults: Omit<City, "id" | "created_at"> = {
    ...data,
    contact_address: data.contact_address ?? null,
    contact_hours: data.contact_hours ?? null,
    contact_phone: data.contact_phone ?? null,
    contact_email: data.contact_email ?? null,
    contact_legal_email: data.contact_legal_email ?? null,
    contact_yandex_map_url: data.contact_yandex_map_url ?? null,
    contact_gallery: data.contact_gallery ?? null,
  };

  if (isPostgresEnabled()) {
    const sql = await getPgSql();
    await sql`
      INSERT INTO cities (
        slug, name_imya, name_roditelny, name_datelny, name_vinitelny, name_tvoritelny, name_predlozhny,
        domain_prefix, contact_address, contact_hours, contact_phone, contact_email, contact_legal_email,
        contact_yandex_map_url, contact_gallery, is_active, created_at
      ) VALUES (
        ${withDefaults.slug.trim()},
        ${withDefaults.name_imya.trim()},
        ${normalizeNullableText(withDefaults.name_roditelny)},
        ${normalizeNullableText(withDefaults.name_datelny)},
        ${normalizeNullableText(withDefaults.name_vinitelny)},
        ${normalizeNullableText(withDefaults.name_tvoritelny)},
        ${normalizeNullableText(withDefaults.name_predlozhny)},
        ${normalizeNullableText(withDefaults.domain_prefix)},
        ${normalizeNullableText(withDefaults.contact_address)},
        ${normalizeNullableText(withDefaults.contact_hours)},
        ${normalizeNullableText(withDefaults.contact_phone)},
        ${normalizeNullableText(withDefaults.contact_email)},
        ${normalizeNullableText(withDefaults.contact_legal_email)},
        ${normalizeNullableText(withDefaults.contact_yandex_map_url)},
        ${normalizeNullableText(withDefaults.contact_gallery)},
        ${withDefaults.is_active ? 1 : 0},
        NOW()
      )
    `;
    return;
  }

  citiesRepository.create(withDefaults);
}

export async function updateCity(id: number, data: Partial<City>): Promise<void> {
  if (isPostgresEnabled()) {
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
        contact_address = ${normalizeNullableText(data.contact_address ?? current.contact_address)},
        contact_hours = ${normalizeNullableText(data.contact_hours ?? current.contact_hours)},
        contact_phone = ${normalizeNullableText(data.contact_phone ?? current.contact_phone)},
        contact_email = ${normalizeNullableText(data.contact_email ?? current.contact_email)},
        contact_legal_email = ${normalizeNullableText(data.contact_legal_email ?? current.contact_legal_email)},
        contact_yandex_map_url = ${normalizeNullableText(data.contact_yandex_map_url ?? current.contact_yandex_map_url)},
        contact_gallery = ${normalizeNullableText(data.contact_gallery ?? current.contact_gallery)},
        is_active = ${data.is_active ?? current.is_active}
      WHERE id = ${id}
    `;
    return;
  }

  const current = await getCityById(id);
  if (!current) return;
  citiesRepository.update(id, {
    slug: data.slug ?? current.slug,
    name_imya: data.name_imya ?? current.name_imya,
    name_roditelny: data.name_roditelny ?? current.name_roditelny,
    name_datelny: data.name_datelny ?? current.name_datelny,
    name_vinitelny: data.name_vinitelny ?? current.name_vinitelny,
    name_tvoritelny: data.name_tvoritelny ?? current.name_tvoritelny,
    name_predlozhny: data.name_predlozhny ?? current.name_predlozhny,
    domain_prefix: data.domain_prefix ?? current.domain_prefix,
    contact_address: data.contact_address ?? current.contact_address,
    contact_hours: data.contact_hours ?? current.contact_hours,
    contact_phone: data.contact_phone ?? current.contact_phone,
    contact_email: data.contact_email ?? current.contact_email,
    contact_legal_email: data.contact_legal_email ?? current.contact_legal_email,
    contact_yandex_map_url: data.contact_yandex_map_url ?? current.contact_yandex_map_url,
    contact_gallery: data.contact_gallery ?? current.contact_gallery,
    is_active: data.is_active ?? current.is_active,
  });
}

export async function deleteCity(id: number): Promise<void> {
  if (isPostgresEnabled()) {
    const sql = await getPgSql();
    await sql`DELETE FROM cities WHERE id = ${id}`;
    return;
  }

  citiesRepository.delete(id);
}
