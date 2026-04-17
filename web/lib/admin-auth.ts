import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "admin_token";

export function getAdminSecret() {
  return process.env.ADMIN_SECRET?.trim() ?? "";
}

export function isAdminSecretConfigured() {
  return Boolean(getAdminSecret());
}

export async function isAdminAuthorized() {
  const secret = getAdminSecret();
  if (!secret) {
    return false;
  }
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE_NAME)?.value === secret;
}

export async function requireAdminAuth() {
  const isAuthorized = await isAdminAuthorized();
  if (!isAuthorized) {
    const h = await headers();
    const path = h.get("x-pathname") || "/admin/filter-pages";
    redirect(`/admin/login?next=${encodeURIComponent(path)}`);
  }
}

export { ADMIN_COOKIE_NAME };
