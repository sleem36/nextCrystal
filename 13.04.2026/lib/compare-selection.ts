/** localStorage: до 3 id для сравнения */
export const COMPARE_STORAGE_KEY = "crystal_compare_car_ids";

export const MAX_COMPARE_CARS = 3;

export function parseCompareIdsFromSearchParam(param: string | undefined): string[] {
  if (!param || typeof param !== "string") {
    return [];
  }
  const parts = param
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of parts) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= MAX_COMPARE_CARS) break;
  }
  return out;
}

export function buildCompareHref(ids: string[]): string {
  const list = ids.slice(0, MAX_COMPARE_CARS);
  if (list.length < 2) {
    return "/compare";
  }
  return `/compare?ids=${encodeURIComponent(list.join(","))}`;
}

export function readCompareIdsFromStorage(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(COMPARE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is string => typeof x === "string")
      .slice(0, MAX_COMPARE_CARS);
  } catch {
    return [];
  }
}

export function writeCompareIdsToStorage(ids: string[]): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const next = ids.slice(0, MAX_COMPARE_CARS);
    window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / private mode
  }
}

/** Добавить/убрать id; не больше MAX_COMPARE_CARS */
export function toggleCompareId(current: string[], id: string): string[] {
  if (current.includes(id)) {
    return current.filter((x) => x !== id);
  }
  if (current.length >= MAX_COMPARE_CARS) {
    return current;
  }
  return [...current, id];
}
