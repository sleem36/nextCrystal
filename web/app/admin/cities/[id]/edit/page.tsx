import { notFound, redirect } from "next/navigation";
import { updateCityAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { requireAdminAuth } from "@/lib/admin-auth";
import { getCityById } from "@/lib/cities-db";

export default async function AdminCitiesEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminAuth();
  const { id } = await params;
  const city = await getCityById(Number(id));
  if (!city) notFound();
  const cityId = city.id;

  async function updateCityFromForm(formData: FormData) {
    "use server";
    await requireAdminAuth();
    await updateCityAction(cityId, formData);
    redirect("/admin/cities");
  }

  return (
    <div className="container-wide space-y-4 py-8">
      <h1 className="text-2xl font-semibold">Редактировать город #{city.id}</h1>
      <form action={updateCityFromForm} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <Input name="slug" label="slug" defaultValue={city.slug} required pattern="[a-z0-9-]+" />
        <Input
          name="name_imya"
          label="name_imya"
          placeholder="Челябинск"
          defaultValue={city.name_imya}
          required
        />
        <Input
          name="name_roditelny"
          label="name_roditelny"
          placeholder="Челябинска"
          defaultValue={city.name_roditelny ?? ""}
        />
        <Input
          name="name_predlozhny"
          label="name_predlozhny"
          placeholder="Челябинске"
          defaultValue={city.name_predlozhny ?? ""}
        />
        <Checkbox name="is_active" label="Активен" defaultChecked={Boolean(city.is_active)} />
        <Button type="submit">Сохранить</Button>
      </form>
    </div>
  );
}
