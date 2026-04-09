import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarDetailLeadClient } from "@/components/catalog/car-detail-lead-client";
import { CarOpenedTracker } from "@/components/catalog/car-opened-tracker";
import { CarPassportBlock } from "@/components/catalog/car-passport-block";
import { CarVideoSection } from "@/components/catalog/car-video-section";
import { VehicleGallery } from "@/components/catalog/vehicle-gallery";
import { driveLabel, fuelLabel, transmissionLabel } from "@/lib/car-labels";
import { formatCurrency, formatMileage } from "@/lib/format";
import { getCarById } from "@/lib/cars-source";
import { utmFromSearchParams } from "@/lib/utm";

const ctaPrimaryClass =
  "inline-flex h-11 items-center justify-center rounded-[var(--radius-button,0.5rem)] bg-[color:var(--color-brand-accent)] px-6 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(220,38,38,0.35)] transition-colors hover:bg-[color:var(--color-brand-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const car = await getCarById(id);
  if (!car) {
    return { title: "Автомобиль не найден" };
  }
  return {
    title: `${car.brand} ${car.model} ${car.year} — Crystal Motors`,
    description: `Пробег ${formatMileage(car.mileageKm)} км, ${formatCurrency(car.priceRub)}. ${car.cities[0] ?? "Регион"}.`,
  };
}

export default async function CarDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const utm = utmFromSearchParams(sp);
  const car = await getCarById(id);
  if (!car) {
    notFound();
  }

  return (
    <article className="container-wide space-y-8 pb-12 pt-4 md:pb-16 md:pt-6">
      <CarOpenedTracker
        carId={car.id}
        city={car.cities[0] ?? "Барнаул"}
        monthlyBudget={car.monthlyPaymentRub}
        maxPriceRub={car.priceRub}
        bodyType={car.bodyType}
        transmission={car.transmission}
      />
      <nav className="text-sm">
        <Link
          href="/cars"
          className="font-medium text-[color:var(--color-brand-accent)] underline-offset-4 hover:underline"
        >
          ← К каталогу
        </Link>
      </nav>

      <VehicleGallery
        images={car.images}
        brand={car.brand}
        model={car.model}
        year={car.year}
      />

      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--color-brand-primary)] md:text-3xl">
          {car.brand} {car.model}, {car.year}
        </h1>
        <p className="text-sm text-slate-600">
          {car.color} · {transmissionLabel(car.transmission)} · {driveLabel(car.drive)} ·{" "}
          {fuelLabel(car.fuel)}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="text-xs text-slate-500">Цена</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(car.priceRub)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="text-xs text-slate-500">Платёж / мес</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {formatCurrency(car.monthlyPaymentRub)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="text-xs text-slate-500">Пробег</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatMileage(car.mileageKm)} км</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="text-xs text-slate-500">Города</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{car.cities.join(", ")}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <a href="#lead-form" className={ctaPrimaryClass}>
          Оставить заявку по этому авто
        </a>
      </div>

      <CarPassportBlock passport={car.passport} />

      <CarVideoSection url={car.videoReviewUrl} />

      <CarDetailLeadClient car={car} utm={utm} />
    </article>
  );
}
