export const METRIKA_GOALS = {
  heroCtaClick: "hero_cta_click",
  quizCompleted: "quiz_completed",
  /** Переход в каталог с параметрами квиза */
  catalogFromQuizClick: "catalog_from_quiz_click",
  catalogOpened: "catalog_opened",
  catalogFiltersApplied: "catalog_filters_applied",
  carOpened: "car_opened",
  compareOpened: "compare_opened",
  compareAdd: "compare_add",
  compareRemove: "compare_remove",
  noResultsShown: "no_results_shown",
  /** Открыта модалка заявки с карточки авто (не отправка формы) */
  leadModalOpen: "lead_modal_open",
  leadSubmitted: "lead_submitted",
} as const;

declare global {
  interface Window {
    ym?: (
      id: number,
      action: "reachGoal",
      goal: string,
      params?: Record<string, string | number>,
    ) => void;
  }
}

export const trackGoal = (
  metrikaId: number | undefined,
  goal: string,
  params?: Record<string, string | number>,
) => {
  if (!metrikaId || typeof window === "undefined" || !window.ym) {
    return;
  }

  window.ym(metrikaId, "reachGoal", goal, params);
};
