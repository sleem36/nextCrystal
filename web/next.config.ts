import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/** Каталог приложения (`web/`): ограничивает Turbopack и watcher, если IDE открыт на родителе репозитория. */
const appRoot = path.dirname(fileURLToPath(import.meta.url));

/** Разрешённые хосты для dev (HMR / _next), если открываете не через localhost — см. NEXT_DEV_ALLOWED_ORIGINS. */
const allowedDevOrigins = process.env.NEXT_DEV_ALLOWED_ORIGINS?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Доп. домены: NEXT_IMAGE_HOSTS или NEXT_PUBLIC_IMAGE_HOSTS (второе нужно для клиентского allowlist в карточках) */
const extraImageHosts = Array.from(
  new Set(
    [
      ...(process.env.NEXT_IMAGE_HOSTS?.split(",") ?? []),
      ...(process.env.NEXT_PUBLIC_IMAGE_HOSTS?.split(",") ?? []),
    ]
      .map((s) => s.trim())
      .filter(Boolean),
  ),
);

const baseRemotePatterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [
  { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
  { protocol: "https", hostname: "plus.unsplash.com", pathname: "/**" },
  { protocol: "https", hostname: "placehold.co", pathname: "/**" },
  { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
  { protocol: "https", hostname: "orenburg.aurora-auto.ru", pathname: "/media/**" },
];

const extraRemotePatterns = extraImageHosts.map((hostname) => ({
  protocol: "https" as const,
  hostname,
  pathname: "/**" as const,
}));

const nextConfig: NextConfig = {
  ...(allowedDevOrigins?.length ? { allowedDevOrigins } : {}),
  turbopack: {
    root: appRoot,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  images: {
    remotePatterns: [...baseRemotePatterns, ...extraRemotePatterns],
  },
};

export default nextConfig;
