"use client";

import { useCallback, useEffect, useState } from "react";
import { readBookedCarIds, readBookedUntilMap } from "@/lib/booked-cars";

export function useBookedCars() {
  const [bookedIds, setBookedIds] = useState<Set<string>>(() => new Set());
  const [bookedUntilMap, setBookedUntilMap] = useState<Record<string, number>>({});

  const refresh = useCallback(() => {
    setBookedIds(new Set(readBookedCarIds()));
    setBookedUntilMap(readBookedUntilMap());
  }, []);

  useEffect(() => {
    const sync = () => refresh();
    queueMicrotask(sync);
    window.addEventListener("storage", sync);
    window.addEventListener("booked-cars-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("booked-cars-changed", sync);
    };
  }, [refresh]);

  return { bookedIds, bookedUntilMap, refresh };
}
