import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarCreditPanel } from "@/components/catalog/car-credit-panel";
import { CarBuyIntentControls } from "@/components/catalog/car-buy-intent-controls";
import { CarDetailLeadClient } from "@/components/catalog/car-detail-lead-client";
import { CarFactsGrid } from "@/components/catalog/car-facts-grid";
import { CarPhoneReveal } from "@/components/catalog/car-phone-reveal";
import { CarOptionsChips } from "@/components/catalog/car-options-chips";
import { MobileStickyBookingBar } from "@/components/catalog/mobile-sticky-booking-bar";
import { CarOpenedTracker } from "@/components/catalog/car-opened-tracker";
import { RecentlyViewedTracker } from "@/components/catalog/recently-viewed-tracker";
import { CarWishlistToggle } from "@/components/catalog/car-wishlist-toggle";
import { CarPassportBlock } from "@/components/catalog/car-passport-block";
import { CarVideoSection } from "@/components/catalog/car-video-section";
import { TradeInCtaPanel } from "@/components/catalog/trade-in-cta-panel";
import { VehicleGallery } from "@/components/catalog/vehicle-gallery";
import { driveLabel, fuelLabel, transmissionLabel } from "@/lib/car-labels";
import { formatCurrency, formatMileage } from "@/lib/format";
import { getResolvedCarImages } from "@/lib/car-images-map";
import { getCarById, getCars } from "@/lib/cars-source";
import { utmFromSearchParams } from "@/lib/utm";

export const revalidate = 86400;

export async function generateStaticParams() {
  const cars = await getCars();
  return cars.map((car) => ({ id: car.id }));
}

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://next-crystal.vercel.app";
  const canonical = `${siteUrl}/cars/${car.id}`;
  return {
    title: `${car.brand} ${car.model} ${car.year} — Aurora Auto`,
    description: `Пробег ${formatMileage(car.mileageKm)} км, ${formatCurrency(car.priceRub)}. ${car.city}.`,
    alternates: { canonical },
    openGraph: {
      title: `${car.brand} ${car.model} ${car.year} — Aurora Auto`,
      description: `Пробег ${formatMileage(car.mileageKm)} км, ${formatCurrency(car.priceRub)}. ${car.city}.`,
      type: "website",
      url: canonical,
    },
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://next-crystal.vercel.app";
  const galleryImages = getResolvedCarImages(car);
  const galleryAbsolute = galleryImages.map((src) =>
    src.startsWith("/") ? `${siteUrl}${src}` : src,
  );
  const extra = car as typeof car & CarExtraFields;
  const options = [
    ...(extra.options ?? []),
    ...(extra.safetyOptions ?? []),
    ...(extra.exteriorOptions ?? []),
  ];
  const facts = [
    car.year ? { label: "Год", value: String(car.year) } : null,
    car.mileageKm > 0 ? { label: "Пробег", value: `${formatMileage(car.mileageKm)} км` } : null,
    car.city?.trim() ? { label: "Город", value: car.city.trim() } : null,
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
  const carUrl = `${siteUrl}/cars/${car.id}`;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${car.brand} ${car.model} ${car.year}`,
    image: galleryAbsolute,
    description: `${car.brand} ${car.model}, ${car.year}, пробег ${formatMileage(car.mileageKm)} км`,
    offers: {
      "@type": "Offer",
      priceCurrency: "RUB",
      price: car.priceRub,
      availability: "https://schema.org/InStock",
      url: carUrl,
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Каталог", item: `${siteUrl}/cars` },
      { "@type": "ListItem", position: 3, name: `${car.brand} ${car.model}`, item: carUrl },
    ],
  };

  return (
    <article className="container-wide mx-auto max-w-[1280px] space-y-8 pb-24 pt-4 md:pb-16 md:pt-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <RecentlyViewedTracker carId={car.id} />
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
            images={galleryImages}
            brand={car.brand}
            model={car.model}
            year={car.year}
            className="lg:h-full"
          />
        </div>
        <div className="space-y-4 lg:h-full">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--color-brand-primary)] md:text-3xl">
                {car.brand} {car.model}, {car.year}
              </h1>
              <CarWishlistToggle carId={car.id} />
            </div>
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
            <p className="mt-1 text-sm text-slate-600">Авто в наличии и проверено.</p>
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
              <CarBuyIntentControls car={car} utm={utm} />
              <CarPhoneReveal className="mt-0" carId={car.id} city={car.city} paymentMethod={paymentMethod} />
            </div>
            <p className="mt-2 text-xs text-slate-500">Свяжемся в ближайшее время</p>
          </div>
          <CarFactsGrid facts={facts} />
        </div>
      </section>

      {paymentMethod === "credit" ? (
        <CarCreditPanel
          priceRub={car.priceRub}
          monthlyPaymentRub={car.monthlyPaymentRub}
          downPaymentRange={extra.downPaymentRangeRub}
          car={car}
          utm={utm}
        />
      ) : null}

      <CarOptionsChips options={options} />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
        <div className="space-y-6">
          <CarPassportBlock passport={car.passport} />
          <CarVideoSection
            url={car.videoReviewUrl}
            leadHref="#lead-form"
            carId={car.id}
            city={car.city}
            paymentMethod={paymentMethod}
          />
        </div>
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <TradeInCtaPanel leadHref="#lead-form" />
        </div>
      </section>

      <CarDetailLeadClient car={car} utm={utm} />

      <MobileStickyBookingBar priceRub={car.priceRub} />
    </article>
  );
}
