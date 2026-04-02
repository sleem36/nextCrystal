export type CarTag = "family" | "first-car" | "city" | "comfort";
export type CarBodyType = "sedan" | "liftback" | "suv" | "hatchback";

export type Car = {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileageKm: number;
  priceRub: number;
  monthlyPaymentRub: number;
  bodyType: CarBodyType;
  cities: string[];
  trustPoints: string[];
  tags: CarTag[];
};
