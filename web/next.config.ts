import type { NextConfig } from "next";

/** Разрешённые хосты для dev (HMR / _next), если открываете не через localhost — см. NEXT_DEV_ALLOWED_ORIGINS. */
const allowedDevOrigins = process.env.NEXT_DEV_ALLOWED_ORIGINS?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  ...(allowedDevOrigins?.length ? { allowedDevOrigins } : {}),
};

export default nextConfig;
