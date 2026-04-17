import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminSecret, isAdminSecretConfigured } from "@/lib/admin-auth";

async function loginAction(formData: FormData) {
  "use server";

  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin/filter-pages");
  const secret = getAdminSecret();

  if (!secret || password !== secret) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, secret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  redirect(next);
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "1";
  const next = params.next || "/admin/filter-pages";
  const isSecretSet = isAdminSecretConfigured();

  return (
    <div className="container-wide py-10">
      <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Вход в админку</h1>
        {!isSecretSet ? (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            ADMIN_SECRET не задан. Добавьте его в `.env.local`, иначе вход в админку отключен.
          </p>
        ) : null}
        {hasError ? (
          <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            Неверный секрет.
          </p>
        ) : null}
        <form action={loginAction} className="mt-5 space-y-4">
          <input type="hidden" name="next" value={next} />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">ADMIN_SECRET</span>
            <input
              name="password"
              type="password"
              required
              className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none ring-0 focus:border-slate-500"
            />
          </label>
          <button
            type="submit"
            disabled={!isSecretSet}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}
