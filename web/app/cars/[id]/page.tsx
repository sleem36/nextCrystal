import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarCreditPanel } from "@/components/catalog/car-credit-panel";
import { CarDetailLeadClient } from "@/components/catalog/car-detail-lead-client";
import { CarFactsGrid } from "@/components/catalog/car-facts-grid";
import { CarPhoneReveal } from "@/components/catalog/car-phone-reveal";
import { CarOptionsChips } from "@/components/catalog/car-options-chips";
import { MobileStickyBookingBar } from "@/components/catalog/mobile-sticky-booking-bar";
import { CarOpenedTracker } from "@/components/catalog/car-opened-tracker";
import { CarPassportBlock } from "@/components/catalog/car-passport-block";
import { CarVideoSection } from "@/components/catalog/car-video-section";
import { TradeInCtaPanel } from "@/components/catalog/trade-in-cta-panel";
import { VehicleGallery } from "@/components/catalog/vehicle-gallery";
import { driveLabel, fuelLabel, transmissionLabel } from "@/lib/car-labels";
import { formatCurrency, formatMileage } from "@/lib/format";
import { getCarById } from "@/lib/cars-source";
import { utmFromSearchParams } from "@/lib/utm";

const ctaPrimaryClass =
  "inline-flex h-11 items-center justify-center rounded-[var(--radius-button,0.5rem)] bg-[color:var(--color-brand-accent)] px-6 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(220,38,38,0.35)] transition-colors hover:bg-[color:var(--color-brand-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2";

type CarExtraFields = {
  powerHp?: number;
  steeringWheel?: string;
  vin?: string;
  trim?: string;
  options?: string[];
  exteriorOptions?: string[];
  safetyOptions?: string[];
  downPaymentRangeRub?: { from: number; to: number };
};

function maskVin(vin?: string): string | null {
  if (!vin) return null;
  const clean = vin.trim();
  if (clean.length < 6) return clean;
  return `${clean.slice(0, 3)}***${clean.slice(-4)}`;
}

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
    description: `Пробег ${formatMileage(car.mileageKm)} км, ${formatCurrency(car.priceRub)}. ${car.city}.`,
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
  const paymentMethodRaw = Array.isArray(sp.paymentMethod) ? sp.paymentMethod[0] : sp.paymentMethod;
  const paymentMethod = paymentMethodRaw === "cash" ? "cash" : "credit";
  const car = await getCarById(id);
  if (!car) {
    notFound();
  }
  const extra = car as typeof car & CarExtraFields;
  const options = [
    ...(extra.options ?? []),
    ...(extra.safetyOptions ?? []),
    ...(extra.exteriorOptions ?? []),
  ];
  const facts = [
    extra.powerHp ? { label: "Мощность", value: `${extra.powerHp} л.с.` } : null,
    { label: "КПП", value: transmissionLabel(car.transmission) },
    { label: "Привод", value: driveLabel(car.drive) },
    { label: "Владельцы", value: String(car.passport.owners) },
    extra.steeringWheel ? { label: "Руль", value: extra.steeringWheel } : null,
    maskVin(extra.vin) ? { label: "VIN", value: maskVin(extra.vin) as string } : null,
    extra.trim ? { label: "Комплектация", value: extra.trim } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));
  const trustChips = [
    car.passport.mileageVerified ? "VIN и пробег проверены" : null,
    car.passport.ptsStatus === "original" ? "Оригинал ПТС" : null,
    !car.passport.accident.has ? "Без ДТП по отчёту" : null,
  ].filter((item): item is string => Boolean(item));
  const whatsappHref = `https://wa.me/73852554545?text=${encodeURIComponent(
    `Здравствуйте! Интересует ${car.brand} ${car.model} ${car.year} (${car.id}).`,
  )}`;
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(
    "https://crystal-motors.ru/",
  )}&text=${encodeURIComponent(
    `Здравствуйте! Интересует ${car.brand} ${car.model} ${car.year} (${car.id}).`,
  )}`;

  return (
    <article className="container-wide space-y-8 pb-24 pt-4 md:pb-16 md:pt-6">
      <CarOpenedTracker
        carId={car.id}
        city={car.city}
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

      <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(340px,1fr)] lg:items-stretch">
        <div className="w-full lg:h-full">
          <VehicleGallery
            images={car.images}
            brand={car.brand}
            model={car.model}
            year={car.year}
            className="lg:h-full"
          />
        </div>
        <div className="space-y-4 lg:h-full">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-5">
            <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--color-brand-primary)] md:text-3xl">
              {car.brand} {car.model}, {car.year}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {car.color} · {transmissionLabel(car.transmission)} · {driveLabel(car.drive)} ·{" "}
              {fuelLabel(car.fuel)}
            </p>
            <p className="mt-4 text-xs text-slate-500">Цена</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{formatCurrency(car.priceRub)}</p>
            <p className="mt-2 text-sm text-slate-600">
              Платёж / мес:{" "}
              <span className="font-semibold text-slate-900">{formatCurrency(car.monthlyPaymentRub)}</span>
            </p>
            <p className="mt-1 text-sm text-slate-600">Есть интерес к этому авто.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {trustChips.slice(0, 3).map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800"
                >
                  {chip}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="#lead-form" className={ctaPrimaryClass}>
                Оставить заявку
              </a>
              <a
                href="#lead-form"
                className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button,0.5rem)] border border-slate-300 bg-white px-5 text-sm font-semibold text-[color:var(--color-brand-primary)] transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-primary)] focus-visible:ring-offset-2"
              >
                Получить консультацию
              </a>
            </div>
            <CarPhoneReveal />
          </div>
          <CarFactsGrid facts={facts} />
          {paymentMethod === "credit" ? (
            <CarCreditPanel
              monthlyPaymentRub={car.monthlyPaymentRub}
              downPaymentRange={extra.downPaymentRangeRub}
              leadHref="#lead-form"
            />
          ) : null}
        </div>
      </section>

      <CarDetailLeadClient car={car} utm={utm} />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <p className="text-xs text-slate-500">Город</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">{car.city}</p>
      </div>

      <CarPassportBlock passport={car.passport} />

      <CarOptionsChips options={options} />

      <CarVideoSection url={car.videoReviewUrl} leadHref="#lead-form" />

      <section className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-5">
        <h2 className="text-base font-semibold text-[color:var(--color-brand-primary)] md:text-lg">
          Нужна консультация прямо сейчас?
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Напишите в удобный канал, а заявку в форме можно оставить позже.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button,0.5rem)] border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
          >
            Написать в WhatsApp
          </a>
          <a
            href={telegramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button,0.5rem)] border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)] focus-visible:ring-offset-2"
          >
            Написать в Telegram
          </a>
        </div>
      </section>

      <TradeInCtaPanel leadHref="#lead-form" />

      <MobileStickyBookingBar priceRub={car.priceRub} />
    </article>
  );
}
