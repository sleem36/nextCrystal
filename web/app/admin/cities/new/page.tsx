import { redirect } from "next/navigation";
import { createCityAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { requireAdminAuth } from "@/lib/admin-auth";

async function createCityFromForm(formData: FormData) {
  "use server";
  await requireAdminAuth();
  await createCityAction(formData);
  redirect("/admin/cities");
}

export default async function AdminCitiesNewPage() {
  await requireAdminAuth();

  return (
    <div className="container-wide space-y-4 py-8">
      <h1 className="text-2xl font-semibold">Создать город</h1>
      <form action={createCityFromForm} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <Input name="slug" label="slug" required pattern="[a-z0-9-]+" />
        <Input name="name_imya" label="name_imya" placeholder="Челябинск" required />
        <Input name="name_roditelny" label="name_roditelny" placeholder="Челябинска" />
        <Input name="name_predlozhny" label="name_predlozhny" placeholder="Челябинске" />
        <Checkbox name="is_active" label="Активен" defaultChecked />
        <Button type="submit">Сохранить</Button>
      </form>
    </div>
  );
}
