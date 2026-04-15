/**
 * Next Image Optimization запрашивает удалённые URL с сервера. Часть CDN
 * отвечает 403 на такие запросы — для них нужен прямой показ в браузере (`unoptimized`).
 */
const REMOTE_HOSTS_OK_FOR_OPTIMIZER = new Set([
  "images.unsplash.com",
  "plus.unsplash.com",
  "placehold.co",
  "i.ytimg.com",
  /** Фото филиалов на странице контактов (см. contact-locations) */
  "orenburg.aurora-auto.ru",
]);

function extraHostsFromEnv(): string[] {
  if (typeof process === "undefined" || !process.env.NEXT_PUBLIC_IMAGE_HOSTS) {
    return [];
  }
  return process.env.NEXT_PUBLIC_IMAGE_HOSTS.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** `true` — рендерить без оптимизатора Next (картинка грузится в браузере напрямую). */
export function shouldUnoptimizeRemoteImage(src: string): boolean {
  if (src.startsWith("/")) {
    return false;
  }
  try {
    const host = new URL(src).hostname;
    const allowed = new Set([...REMOTE_HOSTS_OK_FOR_OPTIMIZER, ...extraHostsFromEnv()]);
    return !allowed.has(host);
  } catch {
    return true;
  }
}
