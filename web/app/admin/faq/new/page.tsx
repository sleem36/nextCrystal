import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createFaqAction } from "@/app/admin/actions";
import { requireAdminAuth } from "@/lib/admin-auth";

async function createFaqFromForm(formData: FormData) {
  "use server";
  await requireAdminAuth();
  await createFaqAction(formData);
  redirect("/admin/faq");
}

export default async function AdminFaqNewPage() {
  await requireAdminAuth();

  return (
    <div className="container-wide space-y-4 py-8">
      <h1 className="text-2xl font-semibold">Создать FAQ</h1>
      <form action={createFaqFromForm} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <Input name="question" label="Вопрос" required />
        <Textarea name="answer" label="Ответ (можно HTML)" required />
        <Checkbox name="is_active" label="Активен" defaultChecked />
        <Button type="submit">Сохранить</Button>
      </form>
    </div>
  );
}
