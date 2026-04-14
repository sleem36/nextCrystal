import Link from "next/link";
import type { Metadata } from "next";
import { FavoritesClient } from "@/components/favorites/favorites-client";
import { getCars } from "@/lib/cars-source";

export const metadata: Metadata = {
  title: "Избранные автомобили — Crystal Motors",
  description: "Список автомобилей, добавленных в избранное.",
};

export default async function FavoritesPage() {
  const cars = await getCars();

  return (
    <div className="container-wide space-y-5 py-6 md:space-y-6 md:py-8">
      <nav className="text-sm text-slate-500">
        <Link href="/" className="font-medium text-slate-700 underline-offset-4 hover:underline">
          Главная
        </Link>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-900">Избранное</span>
      </nav>

      <FavoritesClient cars={cars} />
    </div>
  );
}

