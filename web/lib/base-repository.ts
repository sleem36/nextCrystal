import type Database from "better-sqlite3";
import { getDb } from "@/lib/sqlite-db";

type PrimitiveId = string | number;
type SqlRaw = { __raw: string };
type RepoValue = unknown | SqlRaw;

function isSqlRaw(value: unknown): value is SqlRaw {
  return Boolean(value) && typeof value === "object" && "__raw" in (value as Record<string, unknown>);
}

export function rawSql(sql: string): SqlRaw {
  return { __raw: sql };
}

type BaseRepositoryOptions<T> = {
  table: string;
  idColumn?: string;
  selectColumns?: string[];
  defaultOrderBy?: string;
  mapRow?: (row: Record<string, unknown>) => T;
  beforeCreate?: (data: Omit<T, "id" | "created_at" | "updated_at">) => Record<string, RepoValue>;
  beforeUpdate?: (data: Partial<T>) => Record<string, RepoValue>;
  dbFactory?: () => Database.Database;
};

export class BaseRepository<T, ID extends PrimitiveId = number> {
  private readonly table: string;
  private readonly idColumn: string;
  private readonly selectColumns?: string[];
  private readonly defaultOrderBy?: string;
  private readonly mapRow: (row: Record<string, unknown>) => T;
  private readonly beforeCreate?: (data: Omit<T, "id" | "created_at" | "updated_at">) => Record<string, RepoValue>;
  private readonly beforeUpdate?: (data: Partial<T>) => Record<string, RepoValue>;
  private readonly dbFactory: () => Database.Database;

  constructor(options: BaseRepositoryOptions<T>) {
    this.table = options.table;
    this.idColumn = options.idColumn ?? "id";
    this.selectColumns = options.selectColumns;
    this.defaultOrderBy = options.defaultOrderBy;
    this.mapRow = options.mapRow ?? ((row) => row as T);
    this.beforeCreate = options.beforeCreate;
    this.beforeUpdate = options.beforeUpdate;
    this.dbFactory = options.dbFactory ?? getDb;
  }

  getAll(orderBy = this.defaultOrderBy): T[] {
    const db = this.dbFactory();
    const columns = this.selectColumns?.length ? this.selectColumns.join(", ") : "*";
    const sql = `SELECT ${columns} FROM ${this.table}${orderBy ? ` ORDER BY ${orderBy}` : ""}`;
    const rows = db.prepare(sql).all() as Record<string, unknown>[];
    return rows.map((row) => this.mapRow(row));
  }

  getById(id: ID): T | null {
    const db = this.dbFactory();
    const columns = this.selectColumns?.length ? this.selectColumns.join(", ") : "*";
    const row = db
      .prepare(`SELECT ${columns} FROM ${this.table} WHERE ${this.idColumn} = ? LIMIT 1`)
      .get(id) as Record<string, unknown> | undefined;
    return row ? this.mapRow(row) : null;
  }

  create(data: Omit<T, "id" | "created_at" | "updated_at">): void {
    const db = this.dbFactory();
    const payload = this.beforeCreate ? this.beforeCreate(data) : (data as Record<string, RepoValue>);
    const columns = Object.keys(payload);
    if (columns.length === 0) {
      return;
    }
    const placeholders = columns
      .map((name) => {
        const value = payload[name];
        return isSqlRaw(value) ? value.__raw : `@${name}`;
      })
      .join(", ");
    const params = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => !isSqlRaw(value)),
    );
    db.prepare(`INSERT INTO ${this.table} (${columns.join(", ")}) VALUES (${placeholders})`).run(params);
  }

  update(id: ID, data: Partial<T>): void {
    const db = this.dbFactory();
    const payload = this.beforeUpdate ? this.beforeUpdate(data) : (data as Record<string, RepoValue>);
    const entries = Object.entries(payload).filter(([, value]) => value !== undefined);
    if (entries.length === 0) {
      return;
    }
    const setClause = entries
      .map(([key, value]) => (isSqlRaw(value) ? `${key} = ${value.__raw}` : `${key} = @${key}`))
      .join(", ");
    const params = Object.fromEntries(entries.filter(([, value]) => !isSqlRaw(value)));
    db.prepare(`UPDATE ${this.table} SET ${setClause} WHERE ${this.idColumn} = @id`).run({
      ...params,
      id,
    });
  }

  delete(id: ID): void {
    const db = this.dbFactory();
    db.prepare(`DELETE FROM ${this.table} WHERE ${this.idColumn} = ?`).run(id);
  }
}
