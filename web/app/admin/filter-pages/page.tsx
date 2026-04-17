import Link from "next/link";
import { requireAdminAuth } from "@/lib/admin-auth";
import { getAllFilterPages } from "@/lib/filter-pages-db";
import { deleteFilterPageAction } from "./actions";

export default async function AdminFilterPagesListPage() {
  await requireAdminAuth();
  const pages = await getAllFilterPages();

  return (
    <div className="container-wide space-y-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">ЧПУ-страницы фильтров</h1>
        <Link
          href="/admin/filter-pages/new"
          className="inline-flex h-10 items-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
        >
          Новая страница
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Обновлена</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.slug} className="border-t border-slate-100">
                <td className="px-4 py-3 font-mono">{page.slug}</td>
                <td className="px-4 py-3">{page.name}</td>
                <td className="px-4 py-3">{page.updated_at}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/filter-pages/${page.slug}/edit`}
                      className="inline-flex h-9 items-center rounded-md border border-slate-300 px-3"
                    >
                      Edit
                    </Link>
                    <form action={deleteFilterPageAction}>
                      <input type="hidden" name="slug" value={page.slug} />
                      <button
                        type="submit"
                        className="inline-flex h-9 items-center rounded-md border border-rose-300 px-3 text-rose-700"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {pages.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Пока нет созданных страниц.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
