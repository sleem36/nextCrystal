import type { CarBodyType, CarDrive, CarFuel, CarTransmission } from "@/types/car";

export function bodyTypeLabel(b: CarBodyType): string {
  const map: Record<CarBodyType, string> = {
    sedan: "Седан",
    liftback: "Лифтбек",
    suv: "Кроссовер/SUV",
    hatchback: "Хэтчбек",
  };
  return map[b];
}

export function transmissionLabel(t: CarTransmission): string {
  return t === "automatic" ? "Автомат" : "Механика";
}

export function driveLabel(d: CarDrive): string {
  if (d === "fwd") return "Передний";
  if (d === "rwd") return "Задний";
  return "Полный";
}

export function fuelLabel(f: CarFuel): string {
  if (f === "petrol") return "Бензин";
  if (f === "diesel") return "Дизель";
  return "Гибрид";
}

/** Строка «2,5 л, бензин» или только топливо, если объёма нет */
export function engineSpecLabel(fuel: CarFuel, engineVolumeL?: number): string {
  const fuelStr = fuelLabel(fuel);
  if (engineVolumeL != null && Number.isFinite(engineVolumeL)) {
    const vol = engineVolumeL.toLocaleString("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    });
    return `${vol} л, ${fuelStr.toLowerCase()}`;
  }
  return fuelStr;
}

/** «Седан, 5» или только тип кузова */
export function bodyWithDoorsLabel(bodyType: CarBodyType, doorCount?: number): string {
  const base = bodyTypeLabel(bodyType);
  if (doorCount != null && doorCount > 0) {
    return `${base}, ${doorCount}`;
  }
  return base;
}
