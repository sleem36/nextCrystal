import "server-only";
import { getPgSql, usePostgres } from "@/lib/db-runtime";
import { getDb } from "@/lib/filter-pages-db";
import type { Faq } from "@/lib/types";

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

export async function getAllFaqs(onlyActive = false): Promise<Faq[]> {
  if (usePostgres()) {
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

  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT id, question, answer, order_index, is_active, created_at, updated_at
        FROM faq
        ${onlyActive ? "WHERE is_active = 1" : ""}
        ORDER BY order_index ASC, id ASC
      `,
    )
    .all() as Record<string, unknown>[];
  return rows.map(mapFaq);
}

export async function getFaqById(id: number): Promise<Faq | null> {
  if (usePostgres()) {
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

  const db = getDb();
  const row = db
    .prepare(
      `
        SELECT id, question, answer, order_index, is_active, created_at, updated_at
        FROM faq
        WHERE id = ?
        LIMIT 1
      `,
    )
    .get(id) as Record<string, unknown> | undefined;
  return row ? mapFaq(row) : null;
}

export async function createFaq(data: Omit<Faq, "id" | "created_at" | "updated_at">): Promise<void> {
  if (usePostgres()) {
    const sql = await getPgSql();
    await sql`
      INSERT INTO faq (question, answer, order_index, is_active, created_at, updated_at)
      VALUES (${data.question.trim()}, ${data.answer.trim()}, ${data.order_index}, ${data.is_active ? 1 : 0}, NOW(), NOW())
    `;
    return;
  }

  const db = getDb();
  db.prepare(
    `
      INSERT INTO faq (question, answer, order_index, is_active, created_at, updated_at)
      VALUES (@question, @answer, @order_index, @is_active, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
  ).run({
    question: data.question.trim(),
    answer: data.answer.trim(),
    order_index: data.order_index,
    is_active: data.is_active ? 1 : 0,
  });
}

export async function updateFaq(id: number, data: Partial<Faq>): Promise<void> {
  if (usePostgres()) {
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

  const db = getDb();
  const current = await getFaqById(id);
  if (!current) return;
  db.prepare(
    `
      UPDATE faq
      SET
        question = @question,
        answer = @answer,
        order_index = @order_index,
        is_active = @is_active,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `,
  ).run({
    id,
    question: (data.question ?? current.question).trim(),
    answer: (data.answer ?? current.answer).trim(),
    order_index: data.order_index ?? current.order_index,
    is_active: data.is_active ?? current.is_active,
  });
}

export async function deleteFaq(id: number): Promise<void> {
  if (usePostgres()) {
    const sql = await getPgSql();
    await sql`DELETE FROM faq WHERE id = ${id}`;
    return;
  }

  const db = getDb();
  db.prepare("DELETE FROM faq WHERE id = ?").run(id);
}

export async function reorderFaqs(ids: number[]): Promise<void> {
  if (ids.length === 0) return;

  if (usePostgres()) {
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
