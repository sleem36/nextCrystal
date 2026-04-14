"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  carListingFiltersToSearchParams,
  hasCatalogFilterParams,
} from "@/lib/car-filters";
import {
  loadQuizAnswers,
  QUIZ_CATALOG_BANNER_DISMISSED_KEY,
  quizAnswersToListingFilters,
} from "@/lib/quiz-answers";
import { UTM_PARAM_KEYS } from "@/lib/utm";

/**
 * Если в URL ещё нет фильтров каталога, но в localStorage есть ответы квиза —
 * предложить применить их явным действием (не перетираем ручной query).
 */
export function QuizCatalogBanner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spKey = searchParams.toString();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    let next = false;
    if (sessionStorage.getItem(QUIZ_CATALOG_BANNER_DISMISSED_KEY) === "1") {
      next = false;
    } else if (hasCatalogFilterParams(searchParams)) {
      next = false;
    } else {
      next = loadQuizAnswers() != null;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- видимость баннера от sessionStorage/URL после гидратации
    setShow(next);
  }, [spKey, searchParams]);

  const apply = () => {
    const answers = loadQuizAnswers();
    if (!answers) {
      return;
    }
    const params = carListingFiltersToSearchParams(quizAnswersToListingFilters(answers));
    for (const key of UTM_PARAM_KEYS) {
      const v = searchParams.get(key);
      if (v) {
        params.set(key, v);
      }
    }
    sessionStorage.setItem(QUIZ_CATALOG_BANNER_DISMISSED_KEY, "1");
    setShow(false);
    router.replace(`/cars?${params.toString()}`);
  };

  const dismiss = () => {
    sessionStorage.setItem(QUIZ_CATALOG_BANNER_DISMISSED_KEY, "1");
    setShow(false);
  };

  if (!show) {
    return null;
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <p className="font-medium text-sky-950">Параметры из квиза на главной</p>
      <p className="mt-1 text-sky-900/90">
        Применить сохранённые ответы к фильтрам каталога? Ручные параметры в адресе мы не меняем без
        вашего нажатия.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" onClick={apply}>
          Применить из квиза
        </Button>
        <Button type="button" variant="secondary" onClick={dismiss}>
          Скрыть
        </Button>
      </div>
    </div>
  );
}
