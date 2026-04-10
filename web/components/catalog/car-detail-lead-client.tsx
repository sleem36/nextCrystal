"use client";

import { useMemo } from "react";
import { LeadForm } from "@/components/landing/lead-form";
import type { Car } from "@/types/car";
import type { CarBodyType } from "@/types/car";

export function CarDetailLeadClient({
  car,
  utm,
}: {
  car: Car;
  utm: Record<string, string>;
}) {
  const context = useMemo(
    () => ({
      city: car.city,
      carId: car.id,
      paymentMethod: "credit" as const,
      monthlyBudget: car.monthlyPaymentRub,
      maxPriceRub: car.priceRub,
      bodyType: car.bodyType as CarBodyType | "any",
      transmission: car.transmission,
      drive: car.drive,
      fuel: car.fuel,
      yearFrom: car.year,
      maxMileageKm: car.mileageKm,
      purchaseGoal: undefined,
      utm,
    }),
    [car, utm],
  );

  return (
    <section id="lead-form" className="scroll-mt-28">
      <LeadForm context={context} variant="card" />
    </section>
  );
}
