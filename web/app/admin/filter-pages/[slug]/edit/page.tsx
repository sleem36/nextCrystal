import { notFound } from "next/navigation";
import { requireAdminAuth } from "@/lib/admin-auth";
import { getFilterPageBySlug } from "@/lib/filter-pages-db";
import { updateFilterPageAction } from "../../actions";
import { FilterPageForm } from "../../filter-page-form";

export default async function AdminFilterPagesEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdminAuth();
  const { slug } = await params;
  const page = await getFilterPageBySlug(slug);
  if (!page) {
    notFound();
  }
  return (
    <div className="container-wide space-y-4 py-8">
      <h1 className="text-2xl font-semibold">Редактирование: {page.slug}</h1>
      <FilterPageForm mode="edit" action={updateFilterPageAction} initial={page} />
    </div>
  );
}
