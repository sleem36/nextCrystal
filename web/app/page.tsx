import { LandingMvp } from "@/components/landing/landing-mvp";
import { ReviewsSection } from "@/components/landing/reviews-section";

export default function Home() {
  return (
    <div className="w-full flex-1 py-6 md:py-8">
      <main>
        <LandingMvp />
        <ReviewsSection />
      </main>
    </div>
  );
}
