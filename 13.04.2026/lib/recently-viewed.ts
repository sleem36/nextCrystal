export const RECENTLY_VIEWED_STORAGE_KEY = "crystal_recently_viewed_car_ids";
const MAX_IDS = 4;

export function readRecentlyViewedIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string").slice(0, MAX_IDS);
  } catch {
    return [];
  }
}

export function recordCarViewed(carId: string): void {
  if (typeof window === "undefined" || !carId) {
    return;
  }
  const prev = readRecentlyViewedIds();
  const next = [carId, ...prev.filter((id) => id !== carId)].slice(0, MAX_IDS);
  try {
    window.localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("recently-viewed-changed"));
  } catch {
    // quota / private mode
  }
}
