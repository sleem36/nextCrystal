export const BOOKED_CARS_STORAGE_KEY = "crystal_booked_car_ids";

const MS_DAY = 24 * 60 * 60 * 1000;

/** Новый формат: срок брони по каждому id */
export type BookedCarsStore = {
  bookedUntil: Record<string, number>;
};

function prune(now: number, bookedUntil: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [id, until] of Object.entries(bookedUntil)) {
    if (until > now) {
      out[id] = until;
    }
  }
  return out;
}

function readStore(): BookedCarsStore {
  if (typeof window === "undefined") {
    return { bookedUntil: {} };
  }
  try {
    const raw = window.localStorage.getItem(BOOKED_CARS_STORAGE_KEY);
    if (!raw) {
      return { bookedUntil: {} };
    }
    const p = JSON.parse(raw) as unknown;
    if (p && typeof p === "object" && !Array.isArray(p) && "bookedUntil" in p) {
      const until = (p as BookedCarsStore).bookedUntil;
      if (until && typeof until === "object") {
        return { bookedUntil: prune(Date.now(), until as Record<string, number>) };
      }
    }
    if (Array.isArray(p)) {
      const now = Date.now();
      const bookedUntil: Record<string, number> = {};
      for (const id of p) {
        if (typeof id === "string") {
          bookedUntil[id] = now + MS_DAY;
        }
      }
      const migrated = { bookedUntil };
      try {
        window.localStorage.setItem(BOOKED_CARS_STORAGE_KEY, JSON.stringify(migrated));
      } catch {
        // ignore
      }
      return migrated;
    }
  } catch {
    // ignore
  }
  return { bookedUntil: {} };
}

function writeStore(store: BookedCarsStore) {
  if (typeof window === "undefined") {
    return;
  }
  const now = Date.now();
  const pruned = { bookedUntil: prune(now, store.bookedUntil) };
  try {
    window.localStorage.setItem(BOOKED_CARS_STORAGE_KEY, JSON.stringify(pruned));
    window.dispatchEvent(new CustomEvent("booked-cars-changed"));
  } catch {
    // quota / private mode
  }
}

/** Активные id (срок брони не истёк) */
export function readBookedCarIds(): string[] {
  const store = readStore();
  const now = Date.now();
  const pruned = prune(now, store.bookedUntil);
  if (Object.keys(pruned).length !== Object.keys(store.bookedUntil).length) {
    writeStore({ bookedUntil: pruned });
  }
  return Object.keys(pruned);
}

export function readBookedUntilMap(): Record<string, number> {
  return readStore().bookedUntil;
}

export function getBookedUntilMs(id: string): number | null {
  const u = readStore().bookedUntil[id];
  if (!u || u <= Date.now()) {
    return null;
  }
  return u;
}

export function addBookedCarId(id: string) {
  if (typeof window === "undefined" || !id) {
    return;
  }
  const store = readStore();
  store.bookedUntil[id] = Date.now() + MS_DAY;
  writeStore(store);
}
