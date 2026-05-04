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
  /** Список городов присутствия/доставки для карточки */
  cities?: string[];
  /** Публичные URL изображений (листинг / галерея) */
  images: string[];
  trustPoints: string[];
  tags: CarTag[];
  passport: CarPassport;
  /** Плоские поля для карточек/API; если нет — берутся из passport */
  ownersCount?: number;
  pts?: CarPtsStatus;
  /** true — было ДТП (как passport.accident.has) */
  accident?: boolean;
  videoReviewUrl?: string;
  /** Зачёркнутая цена для бейджа скидки (если нет — можно сгенерировать на клиенте) */
  oldPriceRub?: number;
  /** Просмотры карточки (для сортировки «по популярности» и соц.доказательства) */
  viewCount?: number;
  /** Сколько раз оформляли бронь (метрика популярности) */
  bookingCount?: number;
  /** Объём двигателя, л (для блока «Характеристики») */
  engineVolumeL?: number;
  /** Число дверей (вместе с кузовом: «Седан, 5») */
  doorCount?: number;
  /** Мощность, л.с. */
  powerHp?: number;
  /** Направление руля, напр. «Левый» / «Правый» */
  steeringWheel?: string;
  /** VIN для карточки (на детальной может маскироваться) */
  vin?: string;
  /** Комплектация или отделка */
  trim?: string;
};
