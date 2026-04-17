import type { FilterPageRecord } from "@/lib/filter-pages-db";
import type { FilterPageFilters } from "@/lib/filter-page-filters";

type Props = {
  mode: "create" | "edit";
  action: (formData: FormData) => void | Promise<void>;
  initial?: FilterPageRecord | null;
};

export function FilterPageForm({ mode, action, initial }: Props) {
  const filters = initial?.filter_json
    ? (JSON.parse(initial.filter_json) as FilterPageFilters)
    : ({} as FilterPageFilters);

  const inputClass =
    "h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-500";

  return (
    <form action={action} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Slug</span>
          <input
            name="slug"
            required
            defaultValue={initial?.slug ?? ""}
            readOnly={mode === "edit"}
            className={inputClass}
            pattern="[a-z0-9-]+"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Name</span>
          <input name="name" required defaultValue={initial?.name ?? ""} className={inputClass} />
        </label>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Фильтры</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <input name="priceFrom" placeholder="Цена от" defaultValue={String(filters.priceFrom ?? "")} className={inputClass} />
          <input name="priceTo" placeholder="Цена до" defaultValue={String(filters.priceTo ?? "")} className={inputClass} />
          <input name="yearFrom" placeholder="Год от" defaultValue={String(filters.yearFrom ?? "")} className={inputClass} />
          <input name="yearTo" placeholder="Год до" defaultValue={String(filters.yearTo ?? "")} className={inputClass} />
          <input
            name="mileageFrom"
            placeholder="Пробег от"
            defaultValue={String(filters.mileageFrom ?? "")}
            className={inputClass}
          />
          <input
            name="mileageTo"
            placeholder="Пробег до"
            defaultValue={String(filters.mileageTo ?? "")}
            className={inputClass}
          />
          <input
            name="bodyType"
            placeholder="Кузов: sedan,suv"
            defaultValue={filters.bodyType?.join(",") ?? ""}
            className={inputClass}
          />
          <input
            name="transmission"
            placeholder="КПП: automatic,manual"
            defaultValue={filters.transmission?.join(",") ?? ""}
            className={inputClass}
          />
          <input
            name="drive"
            placeholder="Привод: fwd,rwd,awd"
            defaultValue={filters.drive?.join(",") ?? ""}
            className={inputClass}
          />
          <input
            name="ownersMax"
            placeholder="Владельцев до"
            defaultValue={String(filters.ownersMax ?? "")}
            className={inputClass}
          />
          <input name="color" placeholder="Цвет" defaultValue={filters.color ?? ""} className={inputClass} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="accidentFree" defaultChecked={Boolean(filters.accidentFree)} />
            Только без ДТП
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="hasVideo" defaultChecked={Boolean(filters.hasVideo)} />
            Только с видео
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">SEO</h2>
        <div className="space-y-3">
          <input name="title" placeholder="Title" defaultValue={initial?.title ?? ""} className={inputClass} />
          <textarea
            name="description"
            placeholder="Description"
            defaultValue={initial?.description ?? ""}
            className="min-h-20 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-slate-500"
          />
          <input name="h1" placeholder="H1" defaultValue={initial?.h1 ?? ""} className={inputClass} />
          <input
            name="bottom_title"
            placeholder="Bottom title (H2)"
            defaultValue={initial?.bottom_title ?? ""}
            className={inputClass}
          />
          <textarea
            name="bottom_text"
            placeholder="Bottom HTML text"
            defaultValue={initial?.bottom_text ?? ""}
            className="min-h-28 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-slate-500"
          />
        </div>
      </section>

      <button className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white">
        {mode === "create" ? "Создать" : "Сохранить"}
      </button>
    </form>
  );
}
