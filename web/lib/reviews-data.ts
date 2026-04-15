export interface Review {
  id: string;
  name: string;
  avatar: string;
  date: string;
  rating: 5 | 4 | 3;
  text: string;
  carModel?: string;
  fullReviewUrl?: string;
}

export const reviews: Review[] = [
  {
    id: "aleksey-smirnov",
    name: "Алексей Смирнов",
    avatar: "https://ui-avatars.com/api/?name=%D0%90%D0%BB%D0%B5%D0%BA%D1%81%D0%B5%D0%B9+%D0%A1%D0%BC%D0%B8%D1%80%D0%BD%D0%BE%D0%B2&background=2563eb&color=fff&size=160",
    date: "Март 2025",
    rating: 5,
    text: "Купил Lada Vesta 2023. Машина в хорошем состоянии, документы показали сразу и подробно объяснили историю обслуживания.",
    carModel: "Lada Vesta 2023",
  },
  {
    id: "olga-petrova",
    name: "Ольга Петрова",
    avatar: "https://ui-avatars.com/api/?name=%D0%9E%D0%BB%D1%8C%D0%B3%D0%B0+%D0%9F%D0%B5%D1%82%D1%80%D0%BE%D0%B2%D0%B0&background=16a34a&color=fff&size=160",
    date: "Апрель 2025",
    rating: 5,
    text: "Сравнили несколько вариантов в одном бюджете, выбрала Hyundai Solaris. Сделку оформили за день, без скрытых платежей.",
    carModel: "Hyundai Solaris 2020",
  },
  {
    id: "dmitry-kovalev",
    name: "Дмитрий Ковалёв",
    avatar: "https://ui-avatars.com/api/?name=%D0%94%D0%BC%D0%B8%D1%82%D1%80%D0%B8%D0%B9+%D0%9A%D0%BE%D0%B2%D0%B0%D0%BB%D1%91%D0%B2&background=9333ea&color=fff&size=160",
    date: "Январь 2025",
    rating: 5,
    text: "Оформлял покупку в кредит. Менеджер заранее просчитал платежи, условия совпали с тем, что было в договоре. Машину получил в хорошем состоянии.",
    carModel: "Volkswagen Polo 2019",
  },
  {
    id: "maria-ilina",
    name: "Мария Ильина",
    avatar: "https://ui-avatars.com/api/?name=%D0%9C%D0%B0%D1%80%D0%B8%D1%8F+%D0%98%D0%BB%D1%8C%D0%B8%D0%BD%D0%B0&background=f97316&color=fff&size=160",
    date: "Ноябрь 2024",
    rating: 4,
    text: "Понравилось, что можно спокойно сравнить несколько авто и пройти тест-драйв. По документам всё объяснили подробно, оформили без задержек.",
    carModel: "Volkswagen Polo 2018",
  },
  {
    id: "igor-pavlov",
    name: "Игорь Павлов",
    avatar: "https://ui-avatars.com/api/?name=%D0%98%D0%B3%D0%BE%D1%80%D1%8C+%D0%9F%D0%B0%D0%B2%D0%BB%D0%BE%D0%B2&background=0ea5e9&color=fff&size=160",
    date: "Февраль 2025",
    rating: 5,
    text: "Искал семейный кроссовер, помогли выбрать машину с прозрачной историей и адекватным пробегом. После покупки менеджер оставался на связи.",
    carModel: "Nissan Qashqai 2017",
  },
  {
    id: "elena-vorontsova",
    name: "Елена Воронцова",
    avatar: "https://ui-avatars.com/api/?name=%D0%95%D0%BB%D0%B5%D0%BD%D0%B0+%D0%92%D0%BE%D1%80%D0%BE%D0%BD%D1%86%D0%BE%D0%B2%D0%B0&background=ef4444&color=fff&size=160",
    date: "Декабрь 2024",
    rating: 5,
    text: "Очень аккуратная подготовка автомобиля перед выдачей. По цене и по состоянию получила ровно то, что ожидала, никаких неприятных сюрпризов.",
    carModel: "Skoda Rapid 2021",
  },
];
