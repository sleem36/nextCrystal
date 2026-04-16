import { Badge } from "@/components/ui/badge";

export function CarOptionsChips({ options }: { options: string[] }) {
  const uniqueOptions = Array.from(new Set(options.map((item) => item.trim()).filter(Boolean)));
  if (uniqueOptions.length === 0) return null;

  const initialCount = 8;
  const first = uniqueOptions.slice(0, initialCount);
  const rest = uniqueOptions.slice(initialCount);
  const hiddenCount = rest.length;

  return (
    <section className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-5">
      <h2 className="text-lg font-semibold text-[color:var(--color-brand-primary)]">Безопасность и экстерьер</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {first.map((item) => (
          <Badge key={item} className="border border-slate-200 bg-slate-50 text-slate-700">
            {item}
          </Badge>
        ))}
      </div>
      {hiddenCount > 0 ? (
        <details className="group mt-3">
          <summary className="cursor-pointer list-none text-sm font-medium text-[color:var(--color-brand-accent)] underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Показать ещё ({hiddenCount})</span>
            <span className="hidden group-open:inline">Свернуть</span>
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {rest.map((item) => (
              <Badge key={item} className="border border-slate-200 bg-slate-50 text-slate-700">
                {item}
              </Badge>
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}
