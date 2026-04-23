export const METRIKA_GOALS = {
  heroCtaClick: "hero_cta_click",
  /** Переход в каталог со второго CTA на первом экране */
  heroCatalogClick: "hero_catalog_click",
  homeQuickCollectionClick: "home_quick_collection_click",
  homeFeaturedCarClick: "home_featured_car_click",
  homeFinalCtaClick: "home_final_cta_click",
  quizCompleted: "quiz_completed",
  /** Переход в каталог без завершения быстрого подбора */
  quizSkipCatalogClick: "quiz_skip_catalog_click",
  /** Переход в каталог с параметрами квиза */
  catalogFromQuizClick: "catalog_from_quiz_click",
  catalogOpened: "catalog_opened",
  catalogFiltersApplied: "catalog_filters_applied",
  carOpened: "car_opened",
  compareOpened: "compare_opened",
  compareAdd: "compare_add",
  compareRemove: "compare_remove",
  noResultsShown: "no_results_shown",
  phoneRevealed: "phone_revealed",
  videoReviewRequested: "video_review_requested",
  /** Открыта модалка заявки с карточки авто (не отправка формы) */
  leadModalOpen: "lead_modal_open",
  leadSubmitted: "lead_submitted",
  clickCreditFromCard: "click_credit_from_card",
  clickWantToBuy: "click_want_to_buy",
  selectBuyOptionCredit: "select_buy_option_credit",
  selectBuyOptionCash: "select_buy_option_cash",
  openCreditCalculator: "open_credit_calculator",
  changeDownPayment: "change_down_payment",
  changeCreditTerm: "change_credit_term",
  submitCreditFromCalculator: "submit_credit_from_calculator",
  submitCreditSuccess: "submit_credit_success",
  submitCreditError: "submit_credit_error",
  openFormCredit: "open_form_credit",
  openFormCash: "open_form_cash",
  openLeadPopup: "open_lead_popup",
  submitLeadForm: "submit_lead_form",
  submitLeadSuccess: "submit_lead_success",
  submitLeadError: "submit_lead_error",
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
