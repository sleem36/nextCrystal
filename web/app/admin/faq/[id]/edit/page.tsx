import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateFaqAction } from "@/app/admin/actions";
import { requireAdminAuth } from "@/lib/admin-auth";
import { getFaqById } from "@/lib/faq-db";

export default async function AdminFaqEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminAuth();
  const { id } = await params;
  const faqId = Number(id);
  const faq = getFaqById(faqId);
  if (!faq) notFound();

  async function updateFaqFromForm(formData: FormData) {
    "use server";
    await requireAdminAuth();
    await updateFaqAction(faq.id, formData);
    redirect("/admin/faq");
  }

  return (
    <div className="container-wide space-y-4 py-8">
      <h1 className="text-2xl font-semibold">Редактировать FAQ #{faq.id}</h1>
      <form action={updateFaqFromForm} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <Input name="question" label="Вопрос" defaultValue={faq.question} required />
        <Textarea name="answer" label="Ответ (можно HTML)" defaultValue={faq.answer} required />
        <Checkbox name="is_active" label="Активен" defaultChecked={Boolean(faq.is_active)} />
        <Button type="submit">Сохранить</Button>
      </form>
    </div>
  );
}
