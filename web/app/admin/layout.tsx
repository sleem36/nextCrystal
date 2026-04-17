import Link from "next/link";
import type { ReactNode } from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-full bg-slate-100">
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="container-wide flex flex-wrap items-center gap-2 py-3">
          <Link href="/admin/filter-pages" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium">
            Фильтр-страницы
          </Link>
          <Link href="/admin/faq" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium">
            FAQ
          </Link>
          <Link href="/admin/cities" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium">
            Города
          </Link>
          <Link href="/" className="ml-auto rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium">
            На сайт
          </Link>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}
