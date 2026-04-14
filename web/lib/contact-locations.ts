/**
 * Филиалы сети (координаты и контакты по данным публичной витрины aurora-auto.ru/contacts, блок CONTACTS).
 * При необходимости обновите адреса/телефоны у себя в CRM и здесь.
 */
export type ContactBranch = {
  id: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  /** WGS84 */
  lat: number;
  lng: number;
  /** Фото салона с публичной витрины aurora-auto.ru (media/stores/{id}_{n}.png) */
  images: string[];
};

/** База для фото филиалов (как в блоке CONTACTS на странице контактов CM) */
const CM_STORES = "https://orenburg.aurora-auto.ru/media/stores";

function cmPhotos(storeNumericId: number, indices: number[]) {
  return indices.map((n) => `${CM_STORES}/${storeNumericId}_${n}.png`);
}

/** Параметры виджета Яндекса: ll и pt — долгота, широта */
export function buildYandexMapWidgetUrl(lat: number, lng: number, zoom = 16) {
  const ll = `${lng},${lat}`;
  const pt = `${lng},${lat},pm2rdm`;
  return `https://yandex.ru/map-widget/v1/?ll=${encodeURIComponent(ll)}&z=${zoom}&l=map&pt=${encodeURIComponent(pt)}`;
}

export function yandexMapsSearchUrl(branch: Pick<ContactBranch, "city" | "address">) {
  const q = `${branch.city}, ${branch.address}`;
  return `https://yandex.ru/maps/?text=${encodeURIComponent(q)}`;
}

/** Общий ящик юротдела, как на витрине CM */
export const CONTACT_LEGAL_EMAIL = "legaldepartment@aurora-auto.ru";

/**
 * Порядок — как в сети CM (крупные города); по умолчанию Барнаул под каталог MVP.
 */
export const CONTACT_BRANCHES: ContactBranch[] = [
  {
    id: "ekaterinburg",
    city: "Екатеринбург",
    address: "ул. Боевых Дружин, 20",
    phone: "+7 (343) 363-03-69",
    email: "info@cm66.ru",
    hours: "Ежедневно с 9:00 до 20:00",
    lat: 56.842192,
    lng: 60.58824,
    images: cmPhotos(0, [1, 2, 3]),
  },
  {
    id: "chelyabinsk",
    city: "Челябинск",
    address: "ул. Кузнецова, 1А",
    phone: "+7 (351) 220-70-29",
    email: "info@cm174.ru",
    hours: "Ежедневно с 9:00 до 20:00",
    lat: 55.117504,
    lng: 61.360719,
    images: cmPhotos(1, [1, 2, 3, 4, 5]),
  },
  {
    id: "tyumen",
    city: "Тюмень",
    address: "ул. Республики, 254к3",
    phone: "+7 (345) 257-88-74",
    email: "tumen@cm66.ru",
    hours: "Ежедневно с 09:00 до 20:00",
    lat: 57.108741,
    lng: 65.643814,
    images: cmPhotos(2, [1, 2, 3]),
  },
  {
    id: "tomsk",
    city: "Томск",
    address: "ул. Смирнова, 5И",
    phone: "+7 (382) 299-01-03",
    email: "tomsk@aurora-auto.ru",
    hours: "Ежедневно с 9:00 до 20:00",
    lat: 56.525792,
    lng: 84.98845,
    images: cmPhotos(4, [1, 3, 4, 5, 6]),
  },
  {
    id: "omsk",
    city: "Омск",
    address: "Енисейская ул., 18/1",
    phone: "+7 (381) 221-90-23",
    email: "omsk@aurora-auto.ru",
    hours: "Ежедневно с 9:00 до 20:00",
    lat: 54.97658819853188,
    lng: 73.33811667594908,
    images: cmPhotos(7, [1, 2, 3, 4, 5]),
  },
  {
    id: "krasnoyarsk",
    city: "Красноярск",
    address: "Караульная ул., 47",
    phone: "+7 (391) 986-55-96",
    email: "krasnoyarsk@aurora-auto.ru",
    hours: "Ежедневно с 9:00 до 20:00",
    lat: 56.047208,
    lng: 92.885423,
    images: cmPhotos(9, [1, 2, 3, 4, 5]),
  },
  {
    id: "surgut",
    city: "Сургут",
    address: "Производственная ул., 6",
    phone: "+7 (346) 250-02-79",
    email: "surgut@aurora-auto.ru",
    hours: "Ежедневно с 9:00 до 20:00",
    lat: 61.271545,
    lng: 73.428354,
    images: cmPhotos(10, [1, 2, 3, 4, 5]),
  },
  {
    id: "novosibirsk",
    city: "Новосибирск",
    address: "Большевистская ул., 276",
    phone: "+7 (383) 388-51-38",
    email: "novosib@aurora-auto.ru",
    hours: "Ежедневно с 9:00 до 20:00",
    lat: 54.983696,
    lng: 82.999077,
    images: cmPhotos(11, [1, 2, 3]),
  },
  {
    id: "novokuznetsk",
    city: "Новокузнецк",
    address: "Байдаевское шоссе, 22",
    phone: "+7 (384) 334-80-07",
    email: "novokuznetsk@aurora-auto.ru",
    hours: "Ежедневно с 9:00 до 20:00",
    lat: 53.774382,
    lng: 87.276603,
    images: cmPhotos(12, [1, 2, 3, 4, 5]),
  },
  {
    id: "kemerovo",
    city: "Кемерово",
    address: "ул. Тухачевского, 64",
    phone: "+7 (384) 221-59-80",
    email: "kemerovo@aurora-auto.ru",
    hours: "Ежедневно с 9:00 до 20:00",
    lat: 55.30663,
    lng: 86.14107,
    images: cmPhotos(14, [1, 2, 3, 4, 5]),
  },
  {
    id: "barnaul",
    city: "Барнаул",
    address: "Правобережный тракт, 26",
    phone: "+7 (385) 259-03-06",
    email: "barnaul@aurora-auto.ru",
    hours: "Ежедневно с 9:00 до 20:00",
    lat: 53.314767,
    lng: 83.833334,
    images: cmPhotos(15, [1, 2, 3, 4, 5]),
  },
  {
    id: "perm",
    city: "Пермь",
    address: "ул. Спешилова, 101А",
    phone: "+7 (342) 248-28-50",
    email: "perm@aurora-auto.ru",
    hours: "Ежедневно с 9:00 до 20:00",
    lat: 58.034077,
    lng: 56.200976,
    images: cmPhotos(18, [1, 2, 3]),
  },
  {
    id: "orenburg",
    city: "Оренбург",
    address: "Загородное шоссе, 13/7",
    phone: "+7 (353) 250-57-15",
    email: "orenburg@aurora-auto.ru",
    hours: "Ежедневно с 9:00 до 20:00",
    lat: 51.841058,
    lng: 55.162631,
    images: cmPhotos(22, [1, 2, 3]),
  },
];

export const DEFAULT_CONTACT_BRANCH_ID =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_DEFAULT_CONTACT_BRANCH_ID?.trim()) || "barnaul";
