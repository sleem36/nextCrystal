export type CarTag = "family" | "first-car" | "city" | "comfort";
export type CarBodyType = "sedan" | "liftback" | "suv" | "hatchback";

export type CarTransmission = "automatic" | "manual";
export type CarDrive = "fwd" | "rwd" | "awd";
export type CarFuel = "petrol" | "diesel" | "hybrid";

export type CarPtsStatus = "original" | "duplicate";

/** Юридический и фактический «паспорт» авто для блока CarPassport на детальной странице */
export type CarPassport = {
  /** Количество владельцев по ПТС */
  owners: number;
  ptsStatus: CarPtsStatus;
  mileageVerified: boolean;
  accident: {
    has: boolean;
    note?: string;
  };
  paintedParts?: string[];
  warrantyWork?: string;
};

export type Car = {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileageKm: number;
  priceRub: number;
  monthlyPaymentRub: number;
  bodyType: CarBodyType;
  transmission: CarTransmission;
  drive: CarDrive;
  fuel: CarFuel;
  color: string;
  city: string;
  /** Публичные URL изображений (листинг / галерея) */
  images: string[];
  trustPoints: string[];
  tags: CarTag[];
  passport: CarPassport;
  videoReviewUrl?: string;
};
