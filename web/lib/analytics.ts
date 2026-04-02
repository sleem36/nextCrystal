export const METRIKA_GOALS = {
  heroCtaClick: "hero_cta_click",
  scenarioSelected: "scenario_selected",
  quizCompleted: "quiz_completed",
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
