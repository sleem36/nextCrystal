import "server-only";
import { unstable_cache } from "next/cache";
import { BaseRepository, rawSql } from "@/lib/base-repository";
import { getPgSql, isPostgresEnabled } from "@/lib/db-runtime";

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

function normalizeNullableText(value: string | null | undefined) {
  const nextValue = value?.trim();
  return nextValue ? nextValue : null;
}

const filterPagesRepository = new BaseRepository<FilterPageRecord, string>({
  table: "filter_pages",
  idColumn: "slug",
  selectColumns: [
    "slug",
    "name",
    "filter_json",
    "title",
    "description",
    "h1",
    "bottom_title",
    "bottom_text",
    "created_at",
    "updated_at",
  ],
  defaultOrderBy: "updated_at DESC, created_at DESC",
  beforeCreate: (data) => ({
    slug: data.slug,
    name: data.name.trim(),
    filter_json: data.filter_json,
    title: normalizeNullableText(data.title),
    description: normalizeNullableText(data.description),
    h1: normalizeNullableText(data.h1),
    bottom_title: normalizeNullableText(data.bottom_title),
    bottom_text: normalizeNullableText(data.bottom_text),
    created_at: rawSql("CURRENT_TIMESTAMP"),
    updated_at: rawSql("CURRENT_TIMESTAMP"),
  }),
});

const getAllFilterPagesCached = unstable_cache(
  async (): Promise<FilterPageRecord[]> => {
    if (isPostgresEnabled()) {
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

    return filterPagesRepository.getAll();
  },
  ["filter-pages-all"],
  { tags: [FILTER_PAGES_CACHE_TAG] },
);

export async function getAllFilterPages() {
  return getAllFilterPagesCached();
}

export async function getFilterPageBySlug(slug: string): Promise<FilterPageRecord | null> {
  if (isPostgresEnabled()) {
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

  return filterPagesRepository.getById(slug);
}

export async function createFilterPage(data: FilterPageUpsertInput) {
  if (isPostgresEnabled()) {
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

  filterPagesRepository.create(data as Omit<FilterPageRecord, "created_at" | "updated_at">);
}

export async function updateFilterPage(slug: string, data: Omit<FilterPageUpsertInput, "slug">) {
  if (isPostgresEnabled()) {
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

  const dbPayload = {
    name: data.name.trim(),
    filter_json: data.filter_json,
    title: normalizeNullableText(data.title),
    description: normalizeNullableText(data.description),
    h1: normalizeNullableText(data.h1),
    bottom_title: normalizeNullableText(data.bottom_title),
    bottom_text: normalizeNullableText(data.bottom_text),
    updated_at: rawSql("CURRENT_TIMESTAMP"),
  };
  filterPagesRepository.update(slug, dbPayload as unknown as Partial<FilterPageRecord>);
}

export async function deleteFilterPage(slug: string) {
  if (isPostgresEnabled()) {
    const sql = await getPgSql();
    await sql`DELETE FROM filter_pages WHERE slug = ${slug}`;
    return;
  }

  filterPagesRepository.delete(slug);
}
