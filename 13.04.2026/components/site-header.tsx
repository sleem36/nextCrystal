import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md">
      <div className="container-wide flex w-full flex-wrap items-center justify-between gap-3 py-3">
        <div className="min-w-0">
          <Link
            href="/"
            className="block truncate font-bold tracking-tight text-[color:var(--color-brand-primary)] transition-colors hover:text-[color:var(--color-brand-accent)] md:text-lg"
          >
            Aurora Auto
          </Link>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 md:text-xs">
            Федеральная сеть · автомобили с пробегом
          </p>
        </div>
        <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm">
          <Link
            href="/cars"
            className="font-medium text-slate-700 underline-offset-4 transition-colors hover:text-[color:var(--color-brand-accent)] hover:underline"
          >
            Каталог
          </Link>
          <Link
            href="/compare"
            className="font-medium text-slate-700 underline-offset-4 transition-colors hover:text-[color:var(--color-brand-accent)] hover:underline"
          >
            Сравнение
          </Link>
        </nav>
      </div>
    </header>
  );
}
