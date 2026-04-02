import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function StyleGuidePage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10 md:px-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Style Guide</h1>
        <p className="text-sm text-slate-600">
          Минимум визуального шума, контрастные акценты, читаемая типографика.
        </p>
      </section>

      <Card className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Цвета</h2>
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { name: "Primary", className: "bg-slate-900 text-white" },
            { name: "Neutral", className: "bg-slate-100 text-slate-900" },
            { name: "Success", className: "bg-emerald-100 text-emerald-700" },
            { name: "Warning", className: "bg-amber-100 text-amber-800" },
          ].map((item) => (
            <div key={item.name} className={`rounded-xl p-4 text-sm font-medium ${item.className}`}>
              {item.name}
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Типографика</h2>
        <h1 className="text-4xl font-semibold tracking-tight">H1 Заголовок</h1>
        <h2 className="text-2xl font-semibold tracking-tight">H2 Подзаголовок</h2>
        <p className="text-base text-slate-700">Основной текст в интерфейсе и пояснения.</p>
        <p className="text-sm text-slate-500">Подпись/secondary текст.</p>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Компоненты</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Badge>Neutral</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="warning">Warning</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Default input" placeholder="Введите значение" />
          <Input label="Error input" placeholder="Ошибка" error="Поле обязательно" />
        </div>
      </Card>
    </main>
  );
}
