import Link from "next/link";
import type { Car } from "@/types/car";

export function CompareInsufficient({
  requestedIds,
  missingIds,
  foundCars,
}: {
  requestedIds: string[];
  missingIds: string[];
  foundCars: Car[];
}) {
  return (
    <div className="container-wide space-y-4 py-10 md:py-14">
      <h1 className="text-2xl font-semibold text-[color:var(--color-brand-primary)] md:text-3xl">
        Сравнение не удалось
      </h1>
      <div className="rounded-[var(--radius-card)] border border-blue-200 bg-blue-50 px-4 py-4 text-sm text-blue-950">
        <p className="font-medium">Недостаточно объявлений для сравнения</p>
        <p className="mt-2 text-blue-900/90">
          По ссылке указано {requestedIds.length}{" "}
          {requestedIds.length === 1 ? "объявление" : "объявления"}, но в каталоге найдено только{" "}
          {foundCars.length}.{" "}
          {missingIds.length > 0 ? (
            <>
              Не найдены id:{" "}
              <span className="font-mono font-semibold">{missingIds.join(", ")}</span>.
            </>
          ) : null}
        </p>
      </div>
      <Link
        href="/cars"
        className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] bg-[color:var(--color-brand-accent)] px-6 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,118,234,0.35)] hover:bg-[color:var(--color-brand-accent-hover)]"
      >
        В каталог
      </Link>
    </div>
  );
}
