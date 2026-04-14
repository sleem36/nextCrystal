"use client";

import { useMemo } from "react";
import { LeadForm } from "@/components/landing/lead-form";
import { Modal } from "@/components/ui/modal";
import { addBookedCarId } from "@/lib/booked-cars";
import type { CarBodyType } from "@/types/car";
import type { Car } from "@/types/car";
import type { CarListingFilters } from "@/lib/car-filters";

type BookingModalProps = {
  car: Car | null;
  open: boolean;
  onClose: () => void;
  type: "reservation" | "credit";
  filters: CarListingFilters;
  utm: Record<string, string>;
  onBooked?: () => void;
  onSubmittingChange?: (submitting: boolean, carId: string, type: "reservation" | "credit") => void;
};

export function BookingModal({
  car,
  open,
  onClose,
  type,
  filters,
  utm,
  onBooked,
  onSubmittingChange,
}: BookingModalProps) {
  const context = useMemo(() => {
    if (!car) {
      return null;
    }
    return {
      city: car.city,
      carId: car.id,
      paymentMethod: type === "credit" ? "credit" : filters.paymentMethod,
      monthlyBudget:
        type === "credit"
          ? car.monthlyPaymentRub
          : filters.paymentMethod === "credit"
            ? filters.monthlyBudget
            : undefined,
      maxPriceRub: car.priceRub,
      bodyType: car.bodyType as CarBodyType | "any",
      transmission: car.transmission,
      drive: car.drive,
      fuel: car.fuel,
      yearFrom: car.year,
      maxMileageKm: car.mileageKm,
      purchaseGoal: type,
      utm,
    };
  }, [car, filters, type, utm]);

  if (!car || !context) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={type === "credit" ? "Оформить заявку в кредит" : "Забронировать авто"}
      description={
        type === "credit"
          ? `${car.brand} ${car.model}, ${car.year} — оставьте телефон, менеджер рассчитает одобрение и платеж.`
          : `${car.brand} ${car.model}, ${car.year} — оставьте телефон, менеджер подтвердит бронь.`
      }
    >
      {/* LeadForm: телефон, имя, опционально предоплата — поля «комментарий» нет */}
      <LeadForm
        context={context}
        variant="plain"
        hideTitle
        leadType={type}
        onSubmittingChange={(submitting) => onSubmittingChange?.(submitting, car.id, type)}
        onSuccess={() => {
          if (type === "reservation") {
            addBookedCarId(car.id);
            onBooked?.();
          }
          onClose();
        }}
      />
    </Modal>
  );
}
