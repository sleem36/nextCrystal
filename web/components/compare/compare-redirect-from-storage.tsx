"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  buildCompareHref,
  parseCompareIdsFromSearchParam,
  readCompareIdsFromStorage,
} from "@/lib/compare-selection";

/**
 * Если открыли /compare без ?ids=, но в localStorage уже есть ≥2 id — подставляем их в URL.
 */
export function CompareRedirectFromStorage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const raw = searchParams.get("ids") ?? undefined;
    const fromUrl = parseCompareIdsFromSearchParam(raw);
    if (fromUrl.length >= 2) {
      return;
    }

    const fromStorage = readCompareIdsFromStorage();
    if (fromStorage.length >= 2) {
      router.replace(buildCompareHref(fromStorage));
    }
  }, [router, searchParams]);

  return null;
}
