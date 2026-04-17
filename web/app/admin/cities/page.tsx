import Link from "next/link";
import { Button } from "@/components/ui/button";
import { deleteCityAction } from "@/app/admin/actions";
import { requireAdminAuth } from "@/lib/admin-auth";
import { getAllCities } from "@/lib/cities-db";

async function deleteCityFromForm(formData: FormData) {
  "use server";
  await requireAdminAuth();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) return;
  await deleteCityAction(id);
}

export default async function AdminCitiesPage() {
  await requireAdminAuth();
  const cities = getAllCities(false);

  return (
    <div className="container-wide space-y-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Города</h1>
        <Link href="/admin/cities/new">
          <Button>Создать</Button>
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Именительный</th>
              <th className="px-4 py-3">Активен</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((city) => (
              <tr key={city.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{city.id}</td>
                <td className="px-4 py-3 font-mono">{city.slug}</td>
                <td className="px-4 py-3">{city.name_imya}</td>
                <td className="px-4 py-3">{city.is_active ? "Да" : "Нет"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/cities/${city.id}/edit`}>
                      <Button type="button" variant="secondary" className="h-9 px-3">
                        Edit
                      </Button>
                    </Link>
                    <form action={deleteCityFromForm}>
                      <input type="hidden" name="id" value={city.id} />
                      <Button type="submit" variant="secondary" className="h-9 border-rose-300 px-3 text-rose-700">
                        Delete
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {cities.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Городов пока нет.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
