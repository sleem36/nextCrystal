import "server-only";
import type { Car } from "@/types/car";
import { getCarById, getCars } from "@/lib/cars-source";

/**
 * В проекте каталог пока хранится в JSON/API адаптере (`cars-source`),
 * поэтому репозиторий автомобилей предоставляет единый интерфейс чтения.
 * Когда таблица `cars` появится в SQLite/Postgres — этот модуль станет
 * полноценным BaseRepository без изменения импортов в приложении.
 */
export const carsRepository = {
  async getAll(): Promise<Car[]> {
    return getCars();
  },
  async getById(id: string): Promise<Car | null> {
    return getCarById(id);
  },
};
