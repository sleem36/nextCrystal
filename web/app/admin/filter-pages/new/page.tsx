import { requireAdminAuth } from "@/lib/admin-auth";
import { createFilterPageAction } from "../actions";
import { FilterPageForm } from "../filter-page-form";

export default async function AdminFilterPagesNewPage() {
  await requireAdminAuth();
  return (
    <div className="container-wide space-y-4 py-8">
      <h1 className="text-2xl font-semibold">Новая ЧПУ-страница</h1>
      <FilterPageForm mode="create" action={createFilterPageAction} />
    </div>
  );
}
