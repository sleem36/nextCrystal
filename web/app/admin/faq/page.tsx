import Link from "next/link";
import { Button } from "@/components/ui/button";
import { deleteFaqAction, reorderFaqsAction } from "@/app/admin/actions";
import { requireAdminAuth } from "@/lib/admin-auth";
import { getAllFaqs } from "@/lib/faq-db";

async function reorderFromForm(formData: FormData) {
  "use server";
  await requireAdminAuth();
  const raw = String(formData.get("ids") ?? "");
  const ids = raw
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0);
  await reorderFaqsAction(ids);
}

async function deleteFromForm(formData: FormData) {
  "use server";
  await requireAdminAuth();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) return;
  await deleteFaqAction(id);
}

export default async function AdminFaqListPage() {
  await requireAdminAuth();
  const faqs = await getAllFaqs(false);

  return (
    <div className="container-wide space-y-4 py-8">
      <details className="rounded-xl border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-900">
          Как вставлять переменные города (поддомена)
        </summary>
        <div className="mt-3 space-y-2 text-sm text-slate-700">
          <p>Вставляйте плейсхолдеры прямо в вопрос или ответ FAQ:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <code>{"{{city.imya}}"}</code> - именительный, пример: <span className="font-medium">Челябинск</span>
            </li>
            <li>
              <code>{"{{city.roditelny}}"}</code> - родительный, пример:{" "}
              <span className="font-medium">Челябинска</span>
            </li>
            <li>
              <code>{"{{city.predlozhny}}"}</code> - предложный, пример:{" "}
              <span className="font-medium">Челябинске</span>
            </li>
          </ul>
          <p className="text-slate-600">
            Пример: <code>Где в {"{{city.predlozhny}}"} купить авто с пробегом?</code>
          </p>
        </div>
      </details>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">FAQ</h1>
        <Link href="/admin/faq/new">
          <Button>Создать</Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3">Вопрос</th>
              <th className="px-4 py-3">Порядок</th>
              <th className="px-4 py-3">Активен</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((faq, index) => {
              const canMoveUp = index > 0;
              const canMoveDown = index < faqs.length - 1;
              const moveIds = [...faqs];
              if (canMoveUp) {
                [moveIds[index - 1], moveIds[index]] = [moveIds[index], moveIds[index - 1]];
              }
              const moveUpPayload = moveIds.map((item) => item.id).join(",");

              const moveDownIds = [...faqs];
              if (canMoveDown) {
                [moveDownIds[index], moveDownIds[index + 1]] = [moveDownIds[index + 1], moveDownIds[index]];
              }
              const moveDownPayload = moveDownIds.map((item) => item.id).join(",");

              return (
                <tr key={faq.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{faq.question}</td>
                  <td className="px-4 py-3">{faq.order_index}</td>
                  <td className="px-4 py-3">{faq.is_active ? "Да" : "Нет"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/admin/faq/${faq.id}/edit`}>
                        <Button type="button" variant="secondary" className="h-9 px-3">
                          Edit
                        </Button>
                      </Link>
                      <form action={deleteFromForm}>
                        <input type="hidden" name="id" value={faq.id} />
                        <Button type="submit" variant="secondary" className="h-9 border-rose-300 px-3 text-rose-700">
                          Delete
                        </Button>
                      </form>
                      <form action={reorderFromForm}>
                        <input type="hidden" name="ids" value={moveUpPayload} />
                        <Button type="submit" variant="secondary" className="h-9 px-3" disabled={!canMoveUp}>
                          ↑
                        </Button>
                      </form>
                      <form action={reorderFromForm}>
                        <input type="hidden" name="ids" value={moveDownPayload} />
                        <Button type="submit" variant="secondary" className="h-9 px-3" disabled={!canMoveDown}>
                          ↓
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {faqs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  FAQ пока пуст.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
