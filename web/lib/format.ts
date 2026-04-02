export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);

export const formatMileage = (value: number) =>
  new Intl.NumberFormat("ru-RU").format(value);
