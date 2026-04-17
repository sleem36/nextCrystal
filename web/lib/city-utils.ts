import type { City } from "@/lib/cities-db";

export function replaceCityPlaceholders(text: string, city: City): string {
  return text
    .replace(/\{\{city\.imya\}\}/g, city.name_imya)
    .replace(/\{\{city\.roditelny\}\}/g, city.name_roditelny || city.name_imya)
    .replace(/\{\{city\.datelny\}\}/g, city.name_datelny || city.name_imya)
    .replace(/\{\{city\.vinitelny\}\}/g, city.name_vinitelny || city.name_imya)
    .replace(/\{\{city\.tvoritelny\}\}/g, city.name_tvoritelny || city.name_imya)
    .replace(/\{\{city\.predlozhny\}\}/g, city.name_predlozhny || city.name_imya);
}
