import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { CarsCatalogClient } from "@/components/catalog/cars-catalog-client";
import { getCityBySlug } from "@/lib/cities-db";
import { replaceCityPlaceholders } from "@/lib/city-utils";
import { getCars } from "@/lib/cars-source";
import { getAllFaqs } from "@/lib/faq-db";
import { getAllFilterPages } from "@/lib/filter-pages-db";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Каталог автомобилей с пробегом — Aurora Auto",
  description:
    "Подержанные авто в Барнауле и регионах: цены, фото, фильтры по платежу и бюджету. Заявка на уточнение.",
};

export default async function CarsPage() {
  const cookieStore = await cookies();
  const selectedCity = cookieStore.get("selected_city")?.value;

  const [cars, filterPages, faqs] = await Promise.all([getCars(), getAllFilterPages(), getAllFaqs(true)]);
  const city = selectedCity ? getCityBySlug(selectedCity) : null;
  const faqItems = faqs.map((faq) => ({
    question: city ? replaceCityPlaceholders(faq.question, city) : faq.question,
    answer: city ? replaceCityPlaceholders(faq.answer, city) : faq.answer,
  }));

  return (
    <div className="container-wide space-y-6 py-6 md:py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--color-brand-primary)] md:text-3xl">
          Каталог автомобилей
        </h1>
        <p className="text-sm text-slate-600 md:text-base">
          Подержанные авто с проверкой. Подберите по платежу и городу — или оставьте заявку внизу страницы.
        </p>
      </header>
      <Suspense fallback={<div className="text-sm text-slate-600">Загрузка фильтров…</div>}>
        <CarsCatalogClient
          cars={cars}
          popularFilterLinks={filterPages.map((page) => ({
            slug: page.slug,
            name: page.name,
          }))}
          faqItems={faqItems}
        />
      </Suspense>
    </div>
  );
}
