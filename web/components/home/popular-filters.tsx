import Link from "next/link";
import { getAllFilterPages } from "@/lib/filter-pages-db";

export async function PopularFilters() {
  const pages = await getAllFilterPages();
  if (!pages.length) {
    return null;
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-semibold text-[color:var(--color-brand-primary)]">Популярные фильтры</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {pages.map((page) => (
          <Link
            key={page.slug}
            href={`/cars/${page.slug}`}
            className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1.5 text-sm hover:border-slate-400"
          >
            {page.name || page.slug}
          </Link>
        ))}
      </div>
    </section>
  );
}
