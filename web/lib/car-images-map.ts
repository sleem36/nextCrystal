import type { Car } from "@/types/car";
import manifest from "./car-images-manifest.json";

/** Публичный путь к заглушке (SVG с подписью «Фото отсутствует»). */
export const CAR_IMAGE_PLACEHOLDER = "/images/cars/placeholder.svg";

type CarImagesManifest = Record<string, string[]>;

const byId = manifest as CarImagesManifest;

/**
 * Локальные пути к фото из `public/images/cars/` по данным манифеста (заполняется скриптом `download:images`).
 * Если записи нет — один элемент-заглушка.
 */
export function getCarImages(carId: string): string[] {
  const paths = byId[carId];
  if (Array.isArray(paths) && paths.length > 0) {
    return paths;
  }
  return [CAR_IMAGE_PLACEHOLDER];
}

function isDiscardedPlaceholderUrl(url: string): boolean {
  return url.includes("picsum.photos");
}

/**
 * Галерея для UI: сначала манифест (Unsplash/локальные jpg), иначе валидные URL из `car.images`, иначе заглушка.
 */
export function getResolvedCarImages(car: Pick<Car, "id" | "images">): string[] {
  const fromManifest = byId[car.id];
  if (Array.isArray(fromManifest) && fromManifest.length > 0) {
    return fromManifest;
  }

  const fromData = car.images.filter((u) => !isDiscardedPlaceholderUrl(u));
  if (fromData.length > 0) {
    return fromData;
  }

  return [CAR_IMAGE_PLACEHOLDER];
}
