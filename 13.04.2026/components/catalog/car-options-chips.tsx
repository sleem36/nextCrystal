"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";

export function CarOptionsChips({ options }: { options: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const uniqueOptions = useMemo(
    () => Array.from(new Set(options.map((item) => item.trim()).filter(Boolean))),
    [options],
  );
  if (uniqueOptions.length === 0) return null;

  const initialCount = 8;
  const visible = expanded ? uniqueOptions : uniqueOptions.slice(0, initialCount);
  const hiddenCount = Math.max(0, uniqueOptions.length - initialCount);

  return (
    <section className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-5">
      <h2 className="text-lg font-semibold text-[color:var(--color-brand-primary)]">Безопасность и экстерьер</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {visible.map((item) => (
          <Badge key={item} className="border border-slate-200 bg-slate-50 text-slate-700">
            {item}
          </Badge>
        ))}
      </div>
      {hiddenCount > 0 ? (
        <button
          type="button"
          className="mt-3 text-sm font-medium text-[color:var(--color-brand-accent)] underline-offset-4 hover:underline"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "Свернуть" : `Показать ещё (${hiddenCount})`}
        </button>
      ) : null}
    </section>
  );
}
