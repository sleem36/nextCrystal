import { z } from "zod";
import type { SelectorState } from "@/components/landing/quick-selector";
import {
  carListingFiltersToSearchParams,
  type CarListingFilters,
} from "@/lib/car-filters";

/** Единый ключ localStorage для ответов быстрого подбора (квиз на главной) */
export const QUIZ_ANSWERS_STORAGE_KEY = "crystal_quiz_answers";

/** После «Скрыть» на баннере каталога — не показывать снова до нового сохранения квиза */
export const QUIZ_CATALOG_BANNER_DISMISSED_KEY = "crystal_quiz_catalog_banner_dismissed";

const quizAnswersSchema = z.object({
  monthlyBudget: z.number(),
  maxPriceRub: z.number(),
  bodyType: z.enum(["any", "sedan", "liftback", "suv", "hatchback"]),
  transmission: z.enum(["any", "automatic", "manual"]),
  city: z.string(),
  drive: z.enum(["any", "fwd", "rwd", "awd"]),
  fuel: z.enum(["any", "petrol", "diesel", "hybrid", "electric"]),
  yearFrom: z.number(),
  maxMileageKm: z.number(),
});

export type QuizAnswersState = z.infer<typeof quizAnswersSchema>;

export function saveQuizAnswers(state: SelectorState): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const parsed = quizAnswersSchema.parse(state);
    window.localStorage.setItem(QUIZ_ANSWERS_STORAGE_KEY, JSON.stringify(parsed));
    window.sessionStorage.removeItem(QUIZ_CATALOG_BANNER_DISMISSED_KEY);
  } catch {
    // невалидное состояние не пишем
  }
}

export function loadQuizAnswers(): QuizAnswersState | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(QUIZ_ANSWERS_STORAGE_KEY);
    if (!raw) return null;
    return quizAnswersSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Те же поля, что у фильтров /cars */
export function quizAnswersToListingFilters(state: QuizAnswersState): CarListingFilters {
  return { ...state };
}

/** Ссылка на каталог с фильтрами квиза + сохранение UTM из главной */
export function buildCarsUrlFromQuiz(
  state: SelectorState,
  utm: Record<string, string>,
): string {
  const validated = quizAnswersSchema.parse(state);
  const filters = quizAnswersToListingFilters(validated);
  const p = carListingFiltersToSearchParams(filters);
  for (const [key, value] of Object.entries(utm)) {
    if (value) {
      p.set(key, value);
    }
  }
  return `/cars?${p.toString()}`;
}
