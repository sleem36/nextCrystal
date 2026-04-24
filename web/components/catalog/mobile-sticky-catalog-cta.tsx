"use client";

import { Phone, Sparkles } from "lucide-react";
import { contactSite, telHref } from "@/lib/contact-site";

export function MobileStickyCatalogCta() {
  const phoneHref = telHref(contactSite.phoneDigits);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] backdrop-blur md:hidden">
      <div className="mx-auto flex w-full max-w-5xl items-stretch justify-center gap-2">
        <a
          href={phoneHref}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-button,0.5rem)] border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
        >
          <Phone className="h-4 w-4 shrink-0 text-[color:var(--color-brand-accent)]" aria-hidden />
          Позвонить
        </a>
        <a
          href="#catalog-lead"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-button,0.5rem)] bg-[color:var(--color-brand-accent)] px-3 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,118,234,0.35)] transition hover:bg-[color:var(--color-brand-accent-hover)]"
        >
          <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
          Подобрать авто
        </a>
      </div>
    </div>
  );
}
