const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export const CITY_COOKIE_KEY = "selected_city";

export function parseCityFromCookieHeader(cookieHeader: string | null | undefined): string {
  if (!cookieHeader) {
    return "";
  }
  const pairs = cookieHeader.split("; ");
  const raw = pairs.find((row) => row.startsWith(`${CITY_COOKIE_KEY}=`))?.split("=")[1] ?? "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function buildCityCookie(slug: string): string {
  return `${CITY_COOKIE_KEY}=${encodeURIComponent(slug)}; path=/; max-age=${ONE_YEAR_SECONDS}`;
}

export function setCityCookie(slug: string): void {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = buildCityCookie(slug);
}
