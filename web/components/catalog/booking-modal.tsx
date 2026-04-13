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
  filters: CarListingFilters;
  utm: Record<string, string>;
  onBooked?: () => void;
  onSubmittingChange?: (submitting: boolean, carId: string) => void;
};

export function BookingModal({
  car,
  open,
  onClose,
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
      paymentMethod: filters.paymentMethod,
      monthlyBudget: filters.paymentMethod === "credit" ? filters.monthlyBudget : undefined,
      maxPriceRub: car.priceRub,
      bodyType: car.bodyType as CarBodyType | "any",
      transmission: car.transmission,
      drive: car.drive,
      fuel: car.fuel,
      yearFrom: car.year,
      maxMileageKm: car.mileageKm,
      purchaseGoal: undefined as string | undefined,
      utm,
    };
  }, [car, filters, utm]);

  if (!car || !context) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Забронировать авто"
      description={`${car.brand} ${car.model}, ${car.year} — оставьте телефон, менеджер подтвердит бронь.`}
    >
      {/* LeadForm: телефон, имя, опционально предоплата — поля «комментарий» нет */}
      <LeadForm
        context={context}
        variant="plain"
        hideTitle
        onSubmittingChange={(submitting) => onSubmittingChange?.(submitting, car.id)}
        onSuccess={() => {
          addBookedCarId(car.id);
          onBooked?.();
          onClose();
        }}
      />
    </Modal>
  );
}
