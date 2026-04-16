import { LandingMvp } from "@/components/landing/landing-mvp";
import { ReviewsSection } from "@/components/landing/reviews-section";
import { getCars } from "@/lib/cars-source";

export const revalidate = 3600;

export default async function Home() {
  const cars = await getCars();

  return (
    <div className="w-full flex-1 py-6 md:py-8">
      <main>
        <LandingMvp initialCars={cars} />
        <ReviewsSection />
      </main>
    </div>
  );
}
