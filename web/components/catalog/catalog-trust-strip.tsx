import { FileCheck, History, Scale, ShieldCheck } from "lucide-react";

const items = [
  {
    icon: FileCheck,
    title: "Проверка по VIN",
    text: "Сверка истории и ключевых рисков перед покупкой.",
  },
  {
    icon: Scale,
    title: "Юридическая чистота",
    text: "Сопровождение сделки и прозрачные документы.",
  },
  {
    icon: History,
    title: "Прозрачное состояние",
    text: "Пробег, владельцы и факты по автомобилю в карточке.",
  },
  {
    icon: ShieldCheck,
    title: "Гарантия",
    text: "Техническая гарантия на подходящие авто — уточняйте у менеджера.",
  },
] as const;

export function CatalogTrustStrip() {
  return (
    <section
      aria-label="Почему нам доверяют"
      className="rounded-[var(--radius-card)] border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-5"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 md:text-xs">
        Почему нам доверяют
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="flex gap-3 rounded-xl border border-slate-200/90 bg-white/90 px-3 py-3 shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-brand-accent)]/10 text-[color:var(--color-brand-accent)]">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[color:var(--color-brand-primary)]">{title}</p>
              <p className="mt-0.5 text-xs leading-snug text-slate-600">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
