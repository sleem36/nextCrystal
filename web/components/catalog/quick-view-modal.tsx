"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { formatCurrency, formatMileage } from "@/lib/format";
import { getListingDerived } from "@/lib/car-listing-enrichment";
import { shouldUnoptimizeRemoteImage } from "@/lib/remote-image";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { Car } from "@/types/car";

const BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

function getGalleryImages(car: Car) {
  return car.images.length > 0 ? car.images : [];
}

type QuickViewModalProps = {
  car: Car | null;
  open: boolean;
  onClose: () => void;
  onBook: (car: Car) => void;
};

export function QuickViewModal({ car, open, onClose, onBook }: QuickViewModalProps) {
  const images = useMemo(() => (car ? getGalleryImages(car) : []), [car]);
  const src = images[0];
  const srcUnoptimized = src ? shouldUnoptimizeRemoteImage(src) : false;
  const derived = car ? getListingDerived(car) : null;

  if (!car || !derived) {
    return null;
  }

  const ownersLabel =
    car.passport.owners >= 3 ? "3+" : String(car.passport.owners);
  const ptsOk = car.passport.ptsStatus === "original";
  const dtpOk = !car.passport.accident.has;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${car.brand} ${car.model}`}
      description={`${car.year} · ${formatMileage(car.mileageKm)} км · ${car.city}`}
    >
      <div className="space-y-4">
        {src ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100">
            <Image
              src={src}
              alt={`${car.brand} ${car.model}`}
              fill
              unoptimized={srcUnoptimized}
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 512px"
              placeholder={srcUnoptimized ? "empty" : "blur"}
              blurDataURL={srcUnoptimized ? undefined : BLUR}
              loading="lazy"
            />
            {car.videoReviewUrl ? (
              <span className="absolute right-2 top-2 rounded-md bg-black/55 px-2 py-1 text-xs font-medium text-white">
                Есть видео
              </span>
            ) : null}
          </div>
        ) : null}

        <div>
          <p className="text-2xl font-semibold text-slate-900">{formatCurrency(car.priceRub)}</p>
          {derived.oldPriceRub > car.priceRub ? (
            <p className="text-sm text-emerald-700">
              Выгода {formatCurrency(derived.oldPriceRub - car.priceRub)}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-sm">
          <div className="flex flex-wrap gap-3">
            <span className={car.passport.owners <= 2 ? "text-emerald-700" : "text-amber-800"}>
              Владельцев: {ownersLabel}
            </span>
            <span className={ptsOk ? "text-emerald-700" : "text-rose-700"}>
              ПТС: {ptsOk ? "оригинал" : "дубликат"}
            </span>
            <span className={dtpOk ? "text-emerald-700" : "text-rose-700"}>
              ДТП: {dtpOk ? "нет" : "есть"}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            👁️ {derived.viewCount} смотрят
            {derived.bookingCount > 0 ? ` · забронировали ${derived.bookingCount} раз` : ""}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" className="sm:flex-1" onClick={() => onBook(car)}>
            Забронировать
          </Button>
          <Link
            href={`/cars/${car.id}`}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-[var(--radius-button)] border border-slate-300 bg-white text-sm font-semibold text-[color:var(--color-brand-primary)] hover:bg-slate-50"
            onClick={onClose}
          >
            Полная карточка
          </Link>
        </div>
      </div>
    </Modal>
  );
}
