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
