import "server-only";
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

export function getAllFaqs(onlyActive = false): Faq[] {
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

export function getFaqById(id: number): Faq | null {
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

export function createFaq(data: Omit<Faq, "id" | "created_at" | "updated_at">): void {
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

export function updateFaq(id: number, data: Partial<Faq>): void {
  const db = getDb();
  const current = getFaqById(id);
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

export function deleteFaq(id: number): void {
  const db = getDb();
  db.prepare("DELETE FROM faq WHERE id = ?").run(id);
}

export function reorderFaqs(ids: number[]): void {
  if (ids.length === 0) return;
  const db = getDb();
  const transaction = db.transaction((faqIds: number[]) => {
    const stmt = db.prepare("UPDATE faq SET order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    faqIds.forEach((id, index) => {
      stmt.run(index + 1, id);
    });
  });
  transaction(ids);
}
