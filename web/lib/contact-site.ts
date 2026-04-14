/**
 * Контакты на сайте. Значения по умолчанию — для вёрстки; в продакшене задайте NEXT_PUBLIC_*.
 */
const trim = (v: string | undefined) => (typeof v === "string" ? v.trim() : "");

export const contactSite = {
  phoneDisplay: trim(process.env.NEXT_PUBLIC_CONTACT_PHONE_DISPLAY) || "+7 (3852) 55-45-45",
  /** Цифры для tel: без пробелов и скобок, с ведущей 7 */
  phoneDigits: trim(process.env.NEXT_PUBLIC_CONTACT_PHONE_DIGITS) || "73852554545",
  email: trim(process.env.NEXT_PUBLIC_CONTACT_EMAIL) || "sales@aurora-auto.ru",
  addressFull:
    trim(process.env.NEXT_PUBLIC_CONTACT_ADDRESS) ||
    "Россия, Алтайский край, г. Барнаул, Павловский тракт, д. 251В",
  addressShort: trim(process.env.NEXT_PUBLIC_CONTACT_ADDRESS_SHORT) || "г. Барнаул, Павловский тракт, 251В",
  landmark:
    trim(process.env.NEXT_PUBLIC_CONTACT_LANDMARK) ||
    "Ориентир: въезд с Павловского тракта, парковка у шоурума.",
  hoursLine: trim(process.env.NEXT_PUBLIC_CONTACT_HOURS) || "Пн–Вс: 09:00–20:00",
  /** Ссылка «Открыть в Яндекс.Картах» */
  mapsYandexUrl:
    trim(process.env.NEXT_PUBLIC_YANDEX_MAPS_URL) ||
    "https://yandex.ru/maps/?text=%D0%91%D0%B0%D1%80%D0%BD%D0%B0%D1%83%D0%BB%2C%20%D0%9F%D0%B0%D0%B2%D0%BB%D0%BE%D0%B2%D1%81%D0%BA%D0%B8%D0%B9%20%D1%82%D1%80%D0%B0%D0%BA%D1%82%2C%20251%D0%92",
  mapsGoogleUrl:
    trim(process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL) ||
    "https://www.google.com/maps/search/?api=1&query=53.348%2C83.769",
  telegramUrl:
    trim(process.env.NEXT_PUBLIC_TELEGRAM_URL) || "https://t.me/crystalmotors",
  /** Сообщество или сообщения ВКонтакте */
  vkUrl: trim(process.env.NEXT_PUBLIC_VK_URL) || "https://vk.com/crystalmotors",
  /** Юр. реквизиты — только если заданы (не выдумываем) */
  orgInn: trim(process.env.NEXT_PUBLIC_ORG_INN),
  orgKpp: trim(process.env.NEXT_PUBLIC_ORG_KPP),
  orgOgrn: trim(process.env.NEXT_PUBLIC_ORG_OGRN),
  orgRs: trim(process.env.NEXT_PUBLIC_ORG_RS),
  orgBank: trim(process.env.NEXT_PUBLIC_ORG_BANK),
} as const;

export function telHref(phoneDigits: string) {
  const d = phoneDigits.replace(/\D/g, "");
  if (!d) return "tel:";
  return `tel:+${d.startsWith("7") ? d : `7${d}`}`;
}
