import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function StyleGuidePage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10 md:px-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--color-brand-primary)]">
          Style Guide
        </h1>
        <p className="text-sm text-slate-600">
          Токены в духе{" "}
          <a className="font-medium text-[color:var(--color-link)] underline-offset-2 hover:underline" href="https://crystal-motors.ru/" target="_blank" rel="noopener noreferrer">
            crystal-motors.ru
          </a>
          : светлый фон, тёмная типографика, красный акцент для действий, нейтральные карточки.
        </p>
      </section>

      <Card className="space-y-4 p-6">
        <h2 className="text-xl font-semibold text-[color:var(--color-brand-primary)]">Цвета</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Текст / primary", className: "bg-[color:var(--color-brand-primary)] text-white" },
            { name: "CTA accent", className: "bg-[color:var(--color-brand-accent)] text-white" },
            { name: "Поверхность", className: "border border-slate-200 bg-white text-slate-900" },
            { name: "Фон страницы", className: "bg-[#f3f4f6] text-slate-800" },
          ].map((item) => (
            <div
              key={item.name}
              className={`rounded-[var(--radius-card)] p-4 text-sm font-medium shadow-sm ${item.className}`}
            >
              {item.name}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          CSS: <code className="rounded bg-slate-100 px-1">--color-brand-primary</code>,{" "}
          <code className="rounded bg-slate-100 px-1">--color-brand-accent</code>,{" "}
          <code className="rounded bg-slate-100 px-1">--color-brand-accent-hover</code>,{" "}
          <code className="rounded bg-slate-100 px-1">--radius-card</code>,{" "}
          <code className="rounded bg-slate-100 px-1">--motion-fast</code>
        </p>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="text-xl font-semibold text-[color:var(--color-brand-primary)]">Типографика</h2>
        <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--color-brand-primary)]">
          H1 Заголовок
        </h1>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">H2 Подзаголовок</h2>
        <p className="text-base text-slate-700">Основной текст в интерфейсе и пояснения.</p>
        <p className="text-sm text-slate-500">Подпись/secondary текст.</p>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="text-xl font-semibold text-[color:var(--color-brand-primary)]">Компоненты</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary (CTA)</Button>
          <Button variant="secondary">Secondary</Button>
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
