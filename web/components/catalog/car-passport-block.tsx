import type { ReactNode } from "react";
import type { CarPassport } from "@/types/car";

function StatusPill({ tone, children }: { tone: "ok" | "warn" | "bad" | "neutral"; children: ReactNode }) {
  const map = {
    ok: "bg-emerald-50 text-emerald-900 ring-emerald-200",
    warn: "bg-amber-50 text-amber-900 ring-amber-200",
    bad: "bg-blue-50 text-blue-900 ring-blue-200",
    neutral: "bg-slate-50 text-slate-800 ring-slate-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${map[tone]}`}>
      {children}
    </span>
  );
}

export function CarPassportBlock({ passport }: { passport: CarPassport }) {
  const ptsLabel = passport.ptsStatus === "original" ? "Оригинал ПТС" : "Дубликат ПТС";
  const ptsTone = passport.ptsStatus === "original" ? "ok" : "warn";

  return (
    <section className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-5">
      <h2 className="text-lg font-semibold tracking-tight text-[color:var(--color-brand-primary)]">
        Паспорт автомобиля
      </h2>
      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        <div className="flex flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
          <dt className="text-xs font-medium text-slate-500">Владельцев по ПТС</dt>
          <dd className="font-semibold text-slate-900">{passport.owners}</dd>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
          <dt className="text-xs font-medium text-slate-500">ПТС</dt>
          <dd>
            <StatusPill tone={ptsTone}>{ptsLabel}</StatusPill>
          </dd>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
          <dt className="text-xs font-medium text-slate-500">Пробег</dt>
          <dd>
            <StatusPill tone={passport.mileageVerified ? "ok" : "warn"}>
              {passport.mileageVerified ? "Пробег подтверждён" : "Пробег не подтверждён"}
            </StatusPill>
          </dd>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50/80 p-3 md:col-span-2">
          <dt className="text-xs font-medium text-slate-500">ДТП / повреждения</dt>
          <dd className="space-y-2">
            {passport.accident.has ? (
              <>
                <StatusPill tone="bad">Есть в истории</StatusPill>
                {passport.accident.note ? (
                  <p className="text-slate-700">{passport.accident.note}</p>
                ) : null}
              </>
            ) : (
              <StatusPill tone="ok">Не зафиксированы</StatusPill>
            )}
          </dd>
        </div>
        {passport.paintedParts && passport.paintedParts.length > 0 ? (
          <div className="flex flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50/80 p-3 md:col-span-2">
            <dt className="text-xs font-medium text-slate-500">Окрашенные элементы</dt>
            <dd className="flex flex-wrap gap-1.5">
              {passport.paintedParts.map((part) => (
                <StatusPill key={part} tone="neutral">
                  {part}
                </StatusPill>
              ))}
            </dd>
          </div>
        ) : null}
        {passport.warrantyWork ? (
          <div className="flex flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50/80 p-3 md:col-span-2">
            <dt className="text-xs font-medium text-slate-500">Гарантии / условия</dt>
            <dd className="text-slate-800">{passport.warrantyWork}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
