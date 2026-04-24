import { notFound, redirect } from "next/navigation";
import { updateCityAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
      <form
        action={updateCityFromForm}
        encType="multipart/form-data"
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
      >
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
        <Input
          name="contact_address"
          label="Адрес для контактов"
          placeholder="Правобережный тракт, 26"
          defaultValue={city.contact_address ?? ""}
        />
        <Input
          name="contact_hours"
          label="Время работы"
          placeholder="Ежедневно с 9:00 до 20:00"
          defaultValue={city.contact_hours ?? ""}
        />
        <Input
          name="contact_phone"
          label="Телефон"
          placeholder="+7 (385) 259-03-06"
          defaultValue={city.contact_phone ?? ""}
        />
        <Input
          name="contact_email"
          label="Почта"
          placeholder="barnaul@aurora-auto.ru"
          defaultValue={city.contact_email ?? ""}
        />
        <Input
          name="contact_legal_email"
          label="Юридический отдел"
          placeholder="legaldepartment@aurora-auto.ru"
          defaultValue={city.contact_legal_email ?? ""}
        />
        <Input
          name="contact_yandex_map_url"
          label="Ссылка на карту Яндекс (widget URL)"
          placeholder="https://yandex.ru/map-widget/v1/?..."
          defaultValue={city.contact_yandex_map_url ?? ""}
        />
        <label className="flex flex-col gap-2 text-sm text-slate-700">
          <span className="font-medium">Фото для галереи (загрузка файлов)</span>
          <input
            name="contact_gallery_files"
            type="file"
            accept="image/*"
            multiple
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-800 hover:file:bg-slate-200"
          />
          <span className="text-xs text-slate-500">Можно выбрать несколько изображений сразу.</span>
        </label>
        <Textarea
          name="contact_gallery"
          label="Фото для галереи (пути; можно оставить как есть)"
          placeholder={"/uploads/contacts/barnaul/photo-1.jpg\n/uploads/contacts/barnaul/photo-2.jpg"}
          defaultValue={city.contact_gallery ?? ""}
          rows={5}
        />
        <Checkbox name="is_active" label="Активен" defaultChecked={Boolean(city.is_active)} />
        <Button type="submit">Сохранить</Button>
      </form>
    </div>
  );
}
