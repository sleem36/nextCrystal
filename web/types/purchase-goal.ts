import { CarTag } from "@/types/car";

export type PurchaseGoalId =
  | "daily-reliable"
  | "family-safe"
  | "economy-service"
  | "city-comfort"
  | "trip-capacity";

export const PURCHASE_GOAL_LABELS: Record<PurchaseGoalId, string> = {
  "daily-reliable": "Надежный на каждый день",
  "family-safe": "Для семьи (простор и безопасность)",
  "economy-service": "Экономичный в обслуживании",
  "city-comfort": "Комфорт в городе",
  "trip-capacity": "Вместительный для поездок",
};

export const PURCHASE_GOAL_TO_TAGS: Record<PurchaseGoalId, CarTag[]> = {
  "daily-reliable": ["city"],
  "family-safe": ["family"],
  "economy-service": ["first-car", "city"],
  "city-comfort": ["comfort", "city"],
  "trip-capacity": ["family", "comfort"],
};
