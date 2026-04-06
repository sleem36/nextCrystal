import { Suspense } from "react";
import type { Metadata } from "next";
import { CompareInsufficient } from "@/components/compare/compare-insufficient";
import { CompareRedirectFromStorage } from "@/components/compare/compare-redirect-from-storage";
import { CompareStorageSync } from "@/components/compare/compare-storage-sync";
import { CompareTable } from "@/components/compare/compare-table";
import { CompareTooFew } from "@/components/compare/compare-too-few";
import { parseCompareIdsFromSearchParam } from "@/lib/compare-selection";
import { getCars } from "@/lib/cars-source";

export const metadata: Metadata = {
  title: "Сравнение автомобилей — Crystal Motors",
  description: "Сравните до трёх подержанных автомобилей по цене, пробегу и характеристикам.",
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = sp.ids;
  const idsParam = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  const requestedIds = parseCompareIdsFromSearchParam(idsParam);

  if (requestedIds.length < 2) {
    return (
      <>
        <Suspense fallback={null}>
          <CompareRedirectFromStorage />
        </Suspense>
        <CompareTooFew />
      </>
    );
  }

  const allCars = await getCars();
  const cars = requestedIds
    .map((id) => allCars.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => c != null);
  const missingIds = requestedIds.filter((id) => !allCars.some((c) => c.id === id));

  if (cars.length < 2) {
    return (
      <>
        <CompareStorageSync ids={cars.map((c) => c.id)} />
        <CompareInsufficient
          requestedIds={requestedIds}
          missingIds={missingIds}
          foundCars={cars}
        />
      </>
    );
  }

  const syncIds = requestedIds.filter((id) => cars.some((c) => c.id === id));

  return (
    <>
      <CompareStorageSync ids={syncIds} />
      <CompareTable cars={cars} missingIds={missingIds} />
    </>
  );
}
