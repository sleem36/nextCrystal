import "server-only";
import { BaseRepository, rawSql } from "@/lib/base-repository";
import { getPgSql, isPostgresEnabled } from "@/lib/db-runtime";
import type { Faq } from "@/lib/types";
import { getDb } from "@/lib/sqlite-db";

export type { Faq } from "@/lib/types";

function mapFaq(row: Record<string, unknown>): Faq {
  return {
    id: Number(row.id),
    question: String(row.question ?? ""),
    answer: String(row.answer ?? ""),
    order_index: Number(row.order_index ?? 0),
    is_active: Number(row.is_active ?? 0),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

const faqRepository = new BaseRepository<Faq, number>({
  table: "faq",
  idColumn: "id",
  selectColumns: ["id", "question", "answer", "order_index", "is_active", "created_at", "updated_at"],
  defaultOrderBy: "order_index ASC, id ASC",
  mapRow: mapFaq,
  dbFactory: getDb,
  beforeCreate: (data) => ({
    question: data.question.trim(),
    answer: data.answer.trim(),
    order_index: data.order_index,
    is_active: data.is_active ? 1 : 0,
    created_at: rawSql("CURRENT_TIMESTAMP"),
    updated_at: rawSql("CURRENT_TIMESTAMP"),
  }),
  beforeUpdate: (data) => ({
    ...(data.question !== undefined ? { question: data.question.trim() } : {}),
    ...(data.answer !== undefined ? { answer: data.answer.trim() } : {}),
    ...(data.order_index !== undefined ? { order_index: data.order_index } : {}),
    ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
    updated_at: rawSql("CURRENT_TIMESTAMP"),
  }),
});

export async function getAllFaqs(onlyActive = false): Promise<Faq[]> {
  if (isPostgresEnabled()) {
    const sql = await getPgSql();
    const rows = await sql<Faq[]>`
      SELECT
        id::int as id,
        question,
        answer,
        order_index::int as order_index,
        is_active::int as is_active,
        created_at::text as created_at,
        updated_at::text as updated_at
      FROM faq
      ${onlyActive ? sql`WHERE is_active = 1` : sql``}
      ORDER BY order_index ASC, id ASC
    `;
    return rows;
  }

  if (onlyActive) {
    const rows = getDb()
      .prepare(
        `
          SELECT id, question, answer, order_index, is_active, created_at, updated_at
          FROM faq
          WHERE is_active = 1
          ORDER BY order_index ASC, id ASC
        `,
      )
      .all() as Record<string, unknown>[];
    return rows.map(mapFaq);
  }
  return faqRepository.getAll();
}

export async function getFaqById(id: number): Promise<Faq | null> {
  if (isPostgresEnabled()) {
    const sql = await getPgSql();
    const rows = await sql<Faq[]>`
      SELECT
        id::int as id,
        question,
        answer,
        order_index::int as order_index,
        is_active::int as is_active,
        created_at::text as created_at,
        updated_at::text as updated_at
      FROM faq
      WHERE id = ${id}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  return faqRepository.getById(id);
}

export async function createFaq(data: Omit<Faq, "id" | "created_at" | "updated_at">): Promise<void> {
  if (isPostgresEnabled()) {
    const sql = await getPgSql();
    await sql`
      INSERT INTO faq (question, answer, order_index, is_active, created_at, updated_at)
      VALUES (${data.question.trim()}, ${data.answer.trim()}, ${data.order_index}, ${data.is_active ? 1 : 0}, NOW(), NOW())
    `;
    return;
  }

  faqRepository.create(data);
}

export async function updateFaq(id: number, data: Partial<Faq>): Promise<void> {
  if (isPostgresEnabled()) {
    const current = await getFaqById(id);
    if (!current) return;
    const sql = await getPgSql();
    await sql`
      UPDATE faq
      SET
        question = ${(data.question ?? current.question).trim()},
        answer = ${(data.answer ?? current.answer).trim()},
        order_index = ${data.order_index ?? current.order_index},
        is_active = ${data.is_active ?? current.is_active},
        updated_at = NOW()
      WHERE id = ${id}
    `;
    return;
  }

  const current = await getFaqById(id);
  if (!current) return;
  faqRepository.update(id, {
    question: data.question ?? current.question,
    answer: data.answer ?? current.answer,
    order_index: data.order_index ?? current.order_index,
    is_active: data.is_active ?? current.is_active,
  });
}

export async function deleteFaq(id: number): Promise<void> {
  if (isPostgresEnabled()) {
    const sql = await getPgSql();
    await sql`DELETE FROM faq WHERE id = ${id}`;
    return;
  }

  faqRepository.delete(id);
}

export async function reorderFaqs(ids: number[]): Promise<void> {
  if (ids.length === 0) return;

  if (isPostgresEnabled()) {
    const sql = await getPgSql();
    await sql.begin(async (trx) => {
      for (let index = 0; index < ids.length; index += 1) {
        const id = ids[index];
        await trx`
          UPDATE faq
          SET order_index = ${index + 1}, updated_at = NOW()
          WHERE id = ${id}
        `;
      }
    });
    return;
  }

  const db = getDb();
  const transaction = db.transaction((faqIds: number[]) => {
    const stmt = db.prepare("UPDATE faq SET order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    faqIds.forEach((id, index) => {
      stmt.run(index + 1, id);
    });
  });
  transaction(ids);
}
