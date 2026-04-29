import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarCreditPanel } from "@/components/catalog/car-credit-panel";
import { CarBuyIntentControls } from "@/components/catalog/car-buy-intent-controls";
import { CarDetailLeadClient } from "@/components/catalog/car-detail-lead-client";
import { CarFactsGrid } from "@/components/catalog/car-facts-grid";
import { CarOptionsChips } from "@/components/catalog/car-options-chips";
import { CarsCatalogClient } from "@/components/catalog/cars-catalog-client";
import { MobileStickyBookingBar } from "@/components/catalog/mobile-sticky-booking-bar";
import { CarOpenedTracker } from "@/components/catalog/car-opened-tracker";
import { RecentlyViewedTracker } from "@/components/catalog/recently-viewed-tracker";
import { CarPassportBlock } from "@/components/catalog/car-passport-block";
import { CarVideoSection } from "@/components/catalog/car-video-section";
import { TradeInCtaPanel } from "@/components/catalog/trade-in-cta-panel";
import { VehicleGallery } from "@/components/catalog/vehicle-gallery";
import { getCarsWithFilters, type FilterPageFilters } from "@/lib/filter-page-filters";
import { getFilterPageBySlug, getAllFilterPages } from "@/lib/filter-pages-db";
import { sanitizeRichHtml } from "@/lib/sanitize-html";
import { driveLabel, fuelLabel, transmissionLabel } from "@/lib/car-labels";
import { formatCurrency, formatMileage } from "@/lib/format";
import { getResolvedCarImages } from "@/lib/car-images-map";
import { getCarBySlug, getCars } from "@/lib/cars-source";
import type { Car } from "@/types/car";
import { utmFromSearchParams } from "@/lib/utm";

export const revalidate = 3600;

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

export async function generateStaticParams() {
  const [cars, filterPages] = await Promise.all([getCars(), getAllFilterPages()]);
  return [...cars.map((car) => ({ slug: car.id })), ...filterPages.map((page) => ({ slug: page.slug }))];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (car) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://next-crystal.vercel.app";
    const canonical = `${siteUrl}/cars/${car.id}`;
    const title = `${car.brand} ${car.model} ${car.year} — Aurora Auto`;
    const description = `Пробег ${formatMileage(car.mileageKm)} км, ${formatCurrency(car.priceRub)}. ${car.city}.`;
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { title, description, type: "website", url: canonical },
    };
  }

  const filterPage = await getFilterPageBySlug(slug);
  if (!filterPage) {
    return { title: "Страница не найдена" };
  }
  return {
    title: filterPage.title || filterPage.name,
    description: filterPage.description || `Подборка авто по фильтру: ${filterPage.name}`,
  };
}

async function CarDetailView({
  car,
  searchParams,
}: {
  car: Car;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const utm = utmFromSearchParams(searchParams);
  const paymentMethodRaw = Array.isArray(searchParams.paymentMethod)
    ? searchParams.paymentMethod[0]
    : searchParams.paymentMethod;
  const paymentMethod = paymentMethodRaw === "cash" ? "cash" : "credit";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://next-crystal.vercel.app";
  const galleryImages = getResolvedCarImages(car);
  const galleryAbsolute = galleryImages.map((src) => (src.startsWith("/") ? `${siteUrl}${src}` : src));
  const extra = car as typeof car & CarExtraFields;
  const options = [...(extra.options ?? []), ...(extra.safetyOptions ?? []), ...(extra.exteriorOptions ?? [])];
  const facts = [
    car.year ? { label: "Год", value: String(car.year) } : null,
    car.mileageKm > 0 ? { label: "Пробег", value: `${formatMileage(car.mileageKm)} км` } : null,
    extra.powerHp ? { label: "Мощность", value: `${extra.powerHp} л.с.` } : null,
    { label: "КПП", value: transmissionLabel(car.transmission) },
    { label: "Привод", value: driveLabel(car.drive) },
    extra.steeringWheel ? { label: "Руль", value: extra.steeringWheel } : null,
    maskVin(extra.vin) ? { label: "VIN", value: maskVin(extra.vin) as string } : null,
    extra.trim ? { label: "Комплектация", value: extra.trim } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));
  const topTrustFacts = [
    {
      label: "Город",
      value: car.city,
      tone: "border-slate-200 bg-slate-50 text-slate-900",
    },
    {
      label: "Кузов",
      value: car.bodyType === "suv" ? "Кроссовер/SUV" : car.bodyType === "hatchback" ? "Хэтчбек" : car.bodyType === "liftback" ? "Лифтбек" : "Седан",
      tone: "border-slate-200 bg-slate-50 text-slate-900",
    },
    {
      label: "Платеж / мес",
      value: formatCurrency(car.monthlyPaymentRub),
      tone: "border-emerald-200 bg-emerald-50/70 text-emerald-900",
    },
  ];
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
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
        <VehicleGallery
          images={galleryImages}
          brand={car.brand}
          model={car.model}
          year={car.year}
          className="lg:h-full"
          wishlistCarId={car.id}
        />
        <div className="space-y-4 lg:h-full">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-5">
            <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--color-brand-primary)] md:text-3xl">
              {car.brand} {car.model}, {car.year}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {car.color} · {transmissionLabel(car.transmission)} · {driveLabel(car.drive)} · {fuelLabel(car.fuel)}
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{formatCurrency(car.priceRub)}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {topTrustFacts.map((fact) => (
                <div
                  key={fact.label}
                  className={`rounded-lg border px-3 py-2 ${fact.tone}`}
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide opacity-80">{fact.label}</p>
                  <p className="mt-0.5 text-sm font-semibold">{fact.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <CarBuyIntentControls car={car} utm={utm} paymentMethod={paymentMethod} />
            </div>
          </div>
          <CarFactsGrid facts={facts} />
          <CarPassportBlock passport={car.passport} />
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
          <CarVideoSection url={car.videoReviewUrl} leadHref="#lead-form" carId={car.id} city={car.city} paymentMethod={paymentMethod} />
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

export default async function CarsSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const car = await getCarBySlug(slug);

  if (car) {
    return <CarDetailView car={car} searchParams={sp} />;
  }

  const filterPage = await getFilterPageBySlug(slug);
  if (!filterPage) {
    notFound();
  }

  const filters = JSON.parse(filterPage.filter_json) as FilterPageFilters;
  const [allCars, allFilterPages] = await Promise.all([getCars(), getAllFilterPages()]);
  const filteredCars = getCarsWithFilters(allCars, filters);

  return (
    <div className="container-wide space-y-6 py-6 md:py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--color-brand-primary)] md:text-3xl">
          {filterPage.h1 || filterPage.name}
        </h1>
      </header>
      <CarsCatalogClient
        initialCars={filteredCars}
        initialFilters={{}}
        basePath={`/cars/${slug}`}
        popularFilterLinks={allFilterPages
          .filter((page) => page.slug !== slug)
          .map((page) => ({ slug: page.slug, name: page.name }))}
      />
      {filterPage.bottom_title || filterPage.bottom_text ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          {filterPage.bottom_title ? (
            <h2 className="text-xl font-semibold text-[color:var(--color-brand-primary)]">{filterPage.bottom_title}</h2>
          ) : null}
          {filterPage.bottom_text ? (
            <div
              className="prose mt-3 max-w-none text-sm text-slate-700"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(filterPage.bottom_text) }}
            />
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
