"use client";

import Link from "next/link";
import { bodyTypeLabel, driveLabel, fuelLabel, transmissionLabel } from "@/lib/car-labels";
import { formatCurrency, formatMileage } from "@/lib/format";
import { getResolvedCarImages } from "@/lib/car-images-map";
import type { Car } from "@/types/car";

function th() {
  return "border-b border-slate-300 bg-slate-50 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600";
}

function td() {
  return "border-b border-slate-200 px-3 py-2.5 text-sm text-slate-800";
}

function primaryImageSrc(car: Car) {
  return getResolvedCarImages(car)[0];
}

export function CompareTable({ cars, missingIds }: { cars: Car[]; missingIds: string[] }) {
  const compareIdsParam = cars.map((car) => car.id).join(",");
  return (
    <div className="container-wide space-y-6 py-8 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[color:var(--color-brand-primary)] md:text-3xl">
            Сравнение
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {cars.length}{" "}
            {cars.length === 1 ? "автомобиль" : cars.length < 5 ? "автомобиля" : "автомобилей"} в
            таблице
          </p>
        </div>
        <Link
          href="/cars"
          className="text-sm font-medium text-[color:var(--color-brand-accent)] underline-offset-4 hover:underline"
        >
          ← В каталог
        </Link>
      </div>

      <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-5">
        <h2 className="text-base font-semibold text-[color:var(--color-brand-primary)] md:text-lg">
          Нужна консультация по сравнению?
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Оставьте заявку, и менеджер поможет выбрать лучший вариант из текущего сравнения.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`/cars?fromCompare=1&compareIds=${encodeURIComponent(compareIdsParam)}#catalog-lead`}
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button,0.5rem)] bg-[color:var(--color-brand-accent)] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,118,234,0.35)] transition-colors duration-150 ease-out hover:bg-[color:var(--color-brand-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
          >
            Оставить заявку на консультацию
          </Link>
        </div>
      </div>

      {missingIds.length > 0 ? (
        <div className="rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <span className="font-medium">Часть id не найдена в каталоге: </span>
          <span className="font-mono">{missingIds.join(", ")}</span>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              <th className={th()}>Параметр</th>
              {cars.map((car) => (
                <th key={car.id} className={`${th()} min-w-[160px]`}>
                  <Link
                    href={`/cars/${car.id}`}
                    className="mb-2 block overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={primaryImageSrc(car)}
                      alt={`${car.brand} ${car.model}`}
                      className="h-24 w-full object-cover object-center transition duration-300 hover:scale-[1.02]"
                      width={320}
                      height={180}
                      loading="lazy"
                      decoding="async"
                    />
                  </Link>
                  <Link
                    href={`/cars/${car.id}`}
                    className="font-semibold text-[color:var(--color-brand-primary)] hover:text-[color:var(--color-brand-accent)] hover:underline"
                  >
                    {car.brand} {car.model}
                  </Link>
                  <div className="mt-1 font-normal normal-case text-slate-500">{car.year} г.</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row label="Цена" cars={cars} render={(c) => formatCurrency(c.priceRub)} />
            <Row label="Платёж / мес" cars={cars} render={(c) => formatCurrency(c.monthlyPaymentRub)} />
            <Row label="Пробег" cars={cars} render={(c) => `${formatMileage(c.mileageKm)} км`} />
            <Row label="Кузов" cars={cars} render={(c) => bodyTypeLabel(c.bodyType)} />
            <Row label="КПП" cars={cars} render={(c) => transmissionLabel(c.transmission)} />
            <Row label="Привод" cars={cars} render={(c) => driveLabel(c.drive)} />
            <Row label="Топливо" cars={cars} render={(c) => fuelLabel(c.fuel)} />
            <Row label="Цвет" cars={cars} render={(c) => c.color} />
            <Row label="Город" cars={cars} render={(c) => c.city} />
            <Row label="Владельцев по ПТС" cars={cars} render={(c) => String(c.passport.owners)} />
            <Row
              label="ПТС"
              cars={cars}
              render={(c) => (c.passport.ptsStatus === "original" ? "Оригинал" : "Дубликат")}
            />
            <Row
              label="Пробег подтверждён"
              cars={cars}
              render={(c) => (c.passport.mileageVerified ? "Да" : "Нет")}
            />
            <Row
              label="ДТП в истории"
              cars={cars}
              render={(c) =>
                c.passport.accident.has
                  ? `Да${c.passport.accident.note ? ` (${c.passport.accident.note})` : ""}`
                  : "Нет"
              }
            />
            <Row
              label="Окрашенные элементы"
              cars={cars}
              render={(c) => (c.passport.paintedParts?.length ? c.passport.paintedParts.join(", ") : "—")}
            />
            <Row
              label="Гарантии / условия"
              cars={cars}
              render={(c) => c.passport.warrantyWork ?? "—"}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({
  label,
  cars,
  render,
}: {
  label: string;
  cars: Car[];
  render: (car: Car) => string;
}) {
  return (
    <tr>
      <td className={`${td()} bg-slate-50/80 font-medium text-slate-700`}>{label}</td>
      {cars.map((car) => (
        <td key={car.id} className={td()}>
          {render(car)}
        </td>
      ))}
    </tr>
  );
}
